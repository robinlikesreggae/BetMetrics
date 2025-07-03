import React, { useState } from "react";

interface BetFormProps {
  onBetAdded: () => void;
}

const BetForm: React.FC<BetFormProps> = ({ onBetAdded }) => {
  const [amount, setAmount] = useState<string>("");
  const [odds, setOdds] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("win");
  const [sport, setSport] = useState<string>("");
  const [betType, setBetType] = useState<string>("");
  const [betSource, setBetSource] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const betData = {
      amount: parseFloat(amount),
      odds: parseFloat(odds),
      outcome,
      sport,
      betType,
      betSource,
    };

    if (isNaN(betData.amount) || isNaN(betData.odds) || betData.sport === "") {
      setError(
        "Please fill in all fields with valid numbers for amount and odds."
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(errorData.error || "Failed to add bet");
      }

      setAmount("");
      setOdds("");
      setSport("");
      setOutcome("win");
      setBetType("");
      setBetSource("");
      onBetAdded();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Add New Bet
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAmount(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            step="0.01"
            required
          />
        </div>
        <div>
          <label
            htmlFor="odds"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Odds
          </label>
          <input
            type="number"
            id="odds"
            value={odds}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setOdds(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            step="0.01"
            required
          />
        </div>
        <div>
          <label
            htmlFor="sport"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sport Type
          </label>
          <input
            type="text"
            id="sport"
            value={sport}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSport(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label
            htmlFor="outcome"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Outcome
          </label>
          <select
            id="outcome"
            value={outcome}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setOutcome(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="push">Push</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="betType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Bet Type
          </label>
          <input
            type="text"
            id="betType"
            value={betType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBetType(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label
            htmlFor="betSource"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Bet Source
          </label>
          <input
            type="text"
            id="betSource"
            value={betSource}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBetSource(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div className="dark:bg-neutral-900 dark:text-neutral-100">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Bet
          </button>
        </div>
      </form>
    </div>
  );
};

export default BetForm;
