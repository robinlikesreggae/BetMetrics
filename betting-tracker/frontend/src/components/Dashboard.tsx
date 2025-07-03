import React, { useEffect, useState } from 'react';

interface Stats {
  totalBets: number;
  wins: number;
  losses: number;
  pushes: number;
  winRate: string;
  totalProfitLoss: string;
  roi: string;
}

interface DashboardProps {
  refresh: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ refresh }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('all'); // New state for date range
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [betTypeFilter, setBetTypeFilter] = useState<string>('all');
  const [betSourceFilter, setBetSourceFilter] = useState<string>('all');

  const [uniqueSports, setUniqueSports] = useState<string[]>([]);
  const [uniqueBetTypes, setUniqueBetTypes] = useState<string[]>([]);
  const [uniqueBetSources, setUniqueBetSources] = useState<string[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/stats?range=${dateRange}&sport=${sportFilter}&betType=${betTypeFilter}&betSource=${betSourceFilter}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: Stats = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchStats();
  }, [refresh, dateRange, sportFilter, betTypeFilter, betSourceFilter]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('http://localhost:3000/filters');
        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }
        const data = await response.json();
        setUniqueSports(data.sports);
        setUniqueBetTypes(data.betTypes);
        setUniqueBetSources(data.betSources);
      } catch (err: any) {
        console.error('Error fetching filters:', err.message);
      }
    };
    fetchFilters();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="text-gray-600">Loading stats...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Betting Dashboard</h2>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300">View Stats For:</label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div>
          <label htmlFor="sportFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sport:</label>
          <select
            id="sportFilter"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Sports</option>
            {uniqueSports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="betTypeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bet Type:</label>
          <select
            id="betTypeFilter"
            value={betTypeFilter}
            onChange={(e) => setBetTypeFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Bet Types</option>
            {uniqueBetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="betSourceFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bet Source:</label>
          <select
            id="betSourceFilter"
            value={betSourceFilter}
            onChange={(e) => setBetSourceFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Bet Sources</option>
            {uniqueBetSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Bets</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalBets}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Wins</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.wins}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Losses</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.losses}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pushes</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.pushes}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Win Rate</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.winRate}%</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profit/Loss</h3>
          <p className={`text-3xl font-bold ${parseFloat(stats.totalProfitLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>${stats.totalProfitLoss}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ROI</h3>
          <p className={`text-3xl font-bold ${parseFloat(stats.roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{stats.roi}%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;