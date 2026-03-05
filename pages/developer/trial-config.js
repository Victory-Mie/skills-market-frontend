import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DeveloperTrialConfig() {
  const router = useRouter();
  const { skillId } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skill, setSkill] = useState(null);
  const [stats, setStats] = useState(null);

  // Configuration state
  const [config, setConfig] = useState({
    enabled: true,
    duration: 15,
    maxCpuPercent: 50,
    maxMemoryMB: 512,
    maxDiskMB: 1024,
    maxDailyTrials: 3,
  });

  useEffect(() => {
    if (skillId) {
      fetchConfig();
      fetchStats();
    }
  }, [skillId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trials/config?skillId=${skillId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trial configuration');
      }

      const data = await response.json();
      setSkill(data.skill);

      if (data.enabled !== undefined) {
        setConfig({
          enabled: data.enabled,
          duration: data.duration,
          maxCpuPercent: data.maxCpuPercent,
          maxMemoryMB: data.maxMemoryMB,
          maxDiskMB: data.maxDiskMB,
          maxDailyTrials: data.maxDailyTrials,
        });
      }
    } catch (err) {
      console.error('Error fetching trial config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/developer/trials/stats?skillId=${skillId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.summary);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/developer/trials/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillId,
          ...config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      setSuccess(true);
      fetchStats();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">试用设置</h1>
        <p className="mt-2 text-gray-600">
          {skill ? `配置 "${skill.name}" 的试用功能` : '配置试用功能'}
        </p>
      </div>

      {/* Stats Card */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold mb-4">试用统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-3xl font-bold">{stats.totalTrials}</p>
              <p className="text-blue-100 text-sm">总试用次数</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.uniqueUsers}</p>
              <p className="text-blue-100 text-sm">独立用户</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.completionRate.toFixed(1)}%</p>
              <p className="text-blue-100 text-sm">完成率</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.runningTrials}</p>
              <p className="text-blue-100 text-sm">进行中</p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">试用配置</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">启用试用</h3>
              <p className="text-sm text-gray-600">允许用户免费试用此技能</p>
            </div>
            <button
              onClick={() => handleInputChange('enabled', !config.enabled)}
              className={`${
                config.enabled ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <span
                className={`${
                  config.enabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
              />
            </button>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              试用时长（分钟）
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={config.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              disabled={!config.enabled}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <p className="mt-1 text-sm text-gray-500">
              用户每次可以使用技能的时间（5-60 分钟）
            </p>
          </div>

          {/* Daily Trial Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              每日试用次数限制
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.maxDailyTrials}
              onChange={(e) => handleInputChange('maxDailyTrials', parseInt(e.target.value))}
              disabled={!config.enabled}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <p className="mt-1 text-sm text-gray-500">
              每个用户每天最多可以试用几次（1-10 次）
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Resource Limits */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">资源限制</h3>
            <p className="text-sm text-gray-600 mb-4">
              为试用容器设置资源使用限制，以控制成本
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CPU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大 CPU 使用率 (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={config.maxCpuPercent}
                  onChange={(e) => handleInputChange('maxCpuPercent', parseInt(e.target.value))}
                  disabled={!config.enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              {/* Memory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大内存 (MB)
                </label>
                <input
                  type="number"
                  min="128"
                  max="2048"
                  step="128"
                  value={config.maxMemoryMB}
                  onChange={(e) => handleInputChange('maxMemoryMB', parseInt(e.target.value))}
                  disabled={!config.enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              {/* Disk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大磁盘 (MB)
                </label>
                <input
                  type="number"
                  min="256"
                  max="4096"
                  step="256"
                  value={config.maxDiskMB}
                  onChange={(e) => handleInputChange('maxDiskMB', parseInt(e.target.value))}
                  disabled={!config.enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-sm">配置已保存！</div>
            )}
            <div></div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
