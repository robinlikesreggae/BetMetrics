import React, { useEffect, useState } from 'react';

interface Bet {
  id: number;
  amount: number;
  odds: number;
  outcome: string;
  sport: string;
  betType: string;
  betSource: string;
  date: string;
}

interface BetTableProps {
  refresh: boolean;
  onBetAdded: () => void;
}

const BetTable: React.FC<BetTableProps> = ({ refresh, onBetAdded }) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Bet; direction: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [betToDeleteId, setBetToDeleteId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [betToEdit, setBetToEdit] = useState<Bet | null>(null);
  const [editedBet, setEditedBet] = useState<Bet | null>(null);

  useEffect(() => {
    const fetchBets = async () => {
      setError(null);
      try {
        const response = await fetch('http://localhost:3000/bets');
        if (!response.ok) {
          throw new Error('Failed to fetch bets');
        }
        const data: Bet[] = await response.json();
        setBets(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchBets();
  }, [refresh]);

  const sortedBets = React.useMemo(() => {
    let sortableBets = [...bets];
    if (sortConfig !== null) {
      sortableBets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBets;
  }, [bets, sortConfig]);

  const requestSort = (key: keyof Bet) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteClick = (id: number) => {
    setBetToDeleteId(id);
    setShowConfirmDialog(true);
  };

  const handleEditClick = (bet: Bet) => {
    setBetToEdit(bet);
    setEditedBet(bet);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editedBet) return;

    try {
      const response = await fetch(`http://localhost:3000/bets/${editedBet.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedBet),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update bet');
      }

      // Refresh the bets list after successful update
      setBets(bets.map(bet => (bet.id === editedBet.id ? editedBet : bet)));
      setShowEditModal(false);
      setBetToEdit(null);
      onBetAdded();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const confirmDelete = async () => {
    if (betToDeleteId === null) return;

    try {
      const response = await fetch(`http://localhost:3000/bets/${betToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bet');
      }

      // Refresh the bets list after successful deletion
      setBets(bets.filter(bet => bet.id !== betToDeleteId));
      setBetToDeleteId(null);
      setShowConfirmDialog(false);
      onBetAdded();
    } catch (err: any) {
      setError(err.message);
      setBetToDeleteId(null);
      setShowConfirmDialog(false);
    }
  };

  const cancelDelete = () => {
    setBetToDeleteId(null);
    setShowConfirmDialog(false);
  };

  const getArrow = (key: keyof Bet) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">All Bets</h2>
      {bets.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No bets recorded yet.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                Date{getArrow('date')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('sport')}
              >
                Sport{getArrow('sport')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('amount')}
              >
                Amount{getArrow('amount')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('odds')}
              >
                Odds{getArrow('odds')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('betType')}
              >
                Bet Type{getArrow('betType')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('betSource')}
              >
                Bet Source{getArrow('betSource')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('outcome')}
              >
                Outcome{getArrow('outcome')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedBets.map((bet) => (
              <tr key={bet.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{new Date(bet.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bet.sport}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bet.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bet.odds.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bet.betType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bet.betSource}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  bet.outcome === 'win' ? 'text-green-600' :
                  bet.outcome === 'loss' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {bet.outcome.charAt(0).toUpperCase() + bet.outcome.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(bet)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(bet.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to remove this bet?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && betToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-gray-900 dark:text-gray-100 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Bet</h3>
            <form>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <input type="number" value={editedBet.amount} onChange={(e) => setEditedBet({ ...editedBet, amount: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Odds</label>
                  <input type="number" value={editedBet.odds} onChange={(e) => setEditedBet({ ...editedBet, odds: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Outcome</label>
                  <select value={editedBet.outcome} onChange={(e) => setEditedBet({ ...editedBet, outcome: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <option value="win">Win</option>
                    <option value="loss">Loss</option>
                    <option value="push">Push</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bet Type</label>
                  <input type="text" value={editedBet.betType} onChange={(e) => setEditedBet({ ...editedBet, betType: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bet Source</label>
                  <input type="text" value={editedBet.betSource} onChange={(e) => setEditedBet({ ...editedBet, betSource: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </div>
              </div>
            </form>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetTable;
