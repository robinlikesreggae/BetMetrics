const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./bets.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create bets table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS bets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL,
            odds REAL,
            outcome BOOLEAN,
            sport TEXT,
            betType TEXT,
            betSource TEXT,
            date TEXT
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('Bets table created or already exists.');
            }
        });
    }
});

// API Endpoints

// POST /bets - Save a new bet
app.post('/bets', (req, res) => {
    const { amount, odds, outcome, sport, betType, betSource } = req.body;
    if (amount === undefined || odds === undefined || outcome === undefined || sport === undefined || betType === undefined || betSource === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const date = new Date().toISOString();
    db.run('INSERT INTO bets (amount, odds, outcome, sport, betType, betSource, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [amount, odds, outcome, sport, betType, betSource, date],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// GET /bets - Fetch all bets
app.get('/bets', (req, res) => {
    db.all('SELECT * FROM bets', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /stats - Calculate win rate, ROI
// GET /filters - Get unique values for filters
app.get('/filters', (req, res) => {
    const filters = {};

    db.all('SELECT DISTINCT sport FROM bets', [], (err, rows) => {
        if (err) {
            console.error('Error fetching unique sports:', err.message);
            return res.status(500).json({ error: err.message });
        }
        filters.sports = rows.map(row => row.sport);

        db.all('SELECT DISTINCT betType FROM bets', [], (err, rows) => {
            if (err) {
                console.error('Error fetching unique bet types:', err.message);
                return res.status(500).json({ error: err.message });
            }
            filters.betTypes = rows.map(row => row.betType);

            db.all('SELECT DISTINCT betSource FROM bets', [], (err, rows) => {
                if (err) {
                    console.error('Error fetching unique bet sources:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                filters.betSources = rows.map(row => row.betSource);
                res.json(filters);
            });
        });
    });
});

// GET /stats - Calculate win rate, ROI with filters
app.get('/stats', (req, res) => {
    const { range, sport, betType, betSource } = req.query;
    let startDate = null;
    let endDate = null;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day

    switch (range) {
        case 'today':
            startDate = now.toISOString();
            endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(); // End of today
            break;
        case 'week':
            const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startDate = firstDayOfWeek.toISOString();
            endDate = new Date(firstDayOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1).toISOString(); // End of week
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(); // End of month
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1).toISOString();
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString(); // End of year
            break;
        case 'all':
        default:
            // No date filtering
            break;
    }

    let query = 'SELECT amount, odds, outcome FROM bets';
    let params = [];
    const conditions = [];

    if (startDate && endDate) {
        conditions.push('date BETWEEN ? AND ?');
        params.push(startDate, endDate);
    }
    if (sport && sport !== 'all') {
        conditions.push('sport = ?');
        params.push(sport);
    }
    if (betType && betType !== 'all') {
        conditions.push('betType = ?');
        params.push(betType);
    }
    if (betSource && betSource !== 'all') {
        conditions.push('betSource = ?');
        params.push(betSource);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching stats:', err.message);
            return res.status(500).json({ error: err.message });
        }

        let totalBets = rows.length;
        let wins = 0;
        let pushes = 0;
        let totalProfitLoss = 0;

        rows.forEach(bet => {
            if (bet.outcome === 'win') {
                wins++;
                totalProfitLoss += (bet.amount * bet.odds) - bet.amount;
            } else if (bet.outcome === 'loss') {
                totalProfitLoss -= bet.amount;
            } else if (bet.outcome === 'push') {
                pushes++;
            }
        });

        const winRate = (totalBets - pushes) > 0 ? (wins / (totalBets - pushes)) * 100 : 0;
        const roi = totalBets > 0 ? (totalProfitLoss / rows.reduce((sum, bet) => sum + bet.amount, 0)) * 100 : 0;

        res.json({
            totalBets,
            wins,
            losses: totalBets - wins - pushes,
            pushes,
            winRate: winRate.toFixed(2),
            totalProfitLoss: totalProfitLoss.toFixed(2),
            roi: roi.toFixed(2)
        });
    });
});

// DELETE /bets/:id - Remove a bet
app.delete('/bets/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM bets WHERE id = ?', id, function (err) {
        if (err) {
            console.error('Error deleting bet:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Bet not found' });
        }
        res.status(200).json({ message: 'Bet removed successfully' });
    });
});

// PUT /bets/:id - Update a bet
app.put('/bets/:id', (req, res) => {
    const { id } = req.params;
    const { amount, odds, outcome, betType, betSource } = req.body;

    if (amount === undefined || odds === undefined || outcome === undefined || betType === undefined || betSource === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run('UPDATE bets SET amount = ?, odds = ?, outcome = ?, betType = ?, betSource = ? WHERE id = ?',
        [amount, odds, outcome, betType, betSource, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Bet not found' });
            }
            res.status(200).json({ message: 'Bet updated successfully' });
        }
    );
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
