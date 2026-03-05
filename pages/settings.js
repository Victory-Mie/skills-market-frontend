import { useState, useEffect } from 'react';
import { userApi } from '../lib/api';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        avatar: data.user.avatar || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const data = await userApi.updateProfile(formData);
      setUser(data.user);
      setSuccessMessage('账户信息更新成功！');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">账户设置</h1>
        <p className="mt-2 text-gray-600">管理您的账户信息和偏好设置</p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
        </div>

        <div className="p-6">
          {user && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current avatar preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前头像
                </label>
                <div className="flex items-center space-x-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Current avatar"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                  头像 URL
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="avatar"
                    id="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  输入图片的 URL 地址
                </p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  昵称
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="您的昵称"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  邮箱
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={user.email}
                    readOnly
                    disabled
                    className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  邮箱地址无法修改
                </p>
              </div>

              {/* Role (readonly) */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  账户类型
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="role"
                    id="role"
                    value={user.role === 'USER' ? '普通用户' : user.role === 'DEVELOPER' ? '开发者' : '管理员'}
                    readOnly
                    disabled
                    className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    '保存更改'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account info */}
      {user && (
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">账户信息</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">账户 ID</p>
                <p className="text-gray-900 font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">注册时间</p>
                <p className="text-gray-900">
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">最后更新</p>
                <p className="text-gray-900">
                  {new Date(user.updatedAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
