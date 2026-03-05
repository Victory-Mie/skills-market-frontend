import { useState, useEffect } from 'react';

export default function TrialModal({ skill, onClose, onStartTrial }) {
  const [trialConfig, setTrialConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Fetch trial configuration
  useEffect(() => {
    async function fetchTrialConfig() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/trials/config?skillId=${skill.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trial configuration');
        }

        const data = await response.json();
        setTrialConfig(data);
      } catch (err) {
        console.error('Error fetching trial config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTrialConfig();
  }, [skill.id]);

  // Timer countdown
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRunning]);

  const handleStartTrial = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trials/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ skillId: skill.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start trial');
      }

      const data = await response.json();
      setIsRunning(true);
      setTimeLeft(data.trial.duration * 60); // Convert minutes to seconds
      onStartTrial(data.trial);
    } catch (err) {
      console.error('Error starting trial:', err);
      setError(err.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trial configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Try {skill.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!trialConfig?.enabled && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-medium mb-1">Trial not available</p>
            <p className="text-sm">{trialConfig?.message || 'This skill does not offer a trial.'}</p>
          </div>
        )}

        {trialConfig?.enabled && !isRunning && (
          <div>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <img
                  src={skill.icon || '/default-icon.png'}
                  alt={skill.name}
                  className="w-16 h-16 rounded-lg object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{skill.name}</h3>
                  <p className="text-gray-600 text-sm">{skill.description}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Trial Details</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Duration: {trialConfig.duration} minutes
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Full access to all features
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No credit card required
                  </li>
                </ul>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Start your trial now and experience the full power of {skill.name}. No commitment required.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleStartTrial}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-xl font-bold text-green-800 mb-2">Trial Session Active!</h3>
              <p className="text-green-700 mb-4">Your trial session is now running. Time remaining:</p>
              <div className="text-4xl font-bold text-green-600 mb-4">
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-green-600">
                Make the most of your trial session!
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
