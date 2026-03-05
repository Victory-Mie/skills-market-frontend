import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ordersApi } from '../lib/api';

export default function MyOrdersAndTrials() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'trials'
  const [orders, setOrders] = useState([]);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchTrials();
    }
  }, [activeTab, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await ordersApi.getOrders(params);
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrials = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/trials${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load trials');
      }

      const data = await response.json();
      setTrials(data.trials);
    } catch (err) {
      console.error('Error fetching trials:', err);
      setError('Failed to load trials');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusStyles = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getTrialStatusBadge = (status) => {
    const statusStyles = {
      RUNNING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    const statusLabels = {
      RUNNING: '进行中',
      COMPLETED: '已完成',
      FAILED: '失败',
      CANCELLED: '已取消',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDuration = (startedAt, endsAt) => {
    const start = new Date(startedAt);
    const end = new Date(endsAt);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    return `${minutes} 分钟`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">我的订单与试用</h1>
        <p className="mt-2 text-gray-600">查看您的所有订单和试用记录</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('orders');
              setStatusFilter('all');
            }}
            className={`${
              activeTab === 'orders'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            订单
          </button>
          <button
            onClick={() => {
              setActiveTab('trials');
              setStatusFilter('all');
            }}
            className={`${
              activeTab === 'trials'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            试用记录
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="mb-6">
        {activeTab === 'orders' ? (
          <div className="flex space-x-4">
            {['all', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? '全部' : status}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex space-x-4">
            {['all', 'RUNNING', 'COMPLETED', 'FAILED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? '全部' : status === 'RUNNING' ? '进行中' : status === 'COMPLETED' ? '已完成' : '失败'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && activeTab === 'orders' && orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无订单</p>
        </div>
      )}

      {!loading && !error && activeTab === 'orders' && orders.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/my-orders/${order.id}`}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {order.skill.name}
                          </p>
                          <div className="ml-4 flex-shrink-0">
                            {getOrderStatusBadge(order.paymentStatus)}
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <span className="mr-2">订单号:</span>
                              <span className="font-medium">{order.orderNumber}</span>
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <span className="mr-2">金额:</span>
                              <span className="font-medium">${order.amount.toFixed(2)}</span>
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {new Date(order.createdAt).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trials list */}
      {!loading && !error && activeTab === 'trials' && trials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无试用记录</p>
        </div>
      )}

      {!loading && !error && activeTab === 'trials' && trials.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {trials.map((trial) => (
              <li key={trial.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {trial.skill.name}
                        </p>
                        <div className="ml-4 flex-shrink-0">
                          {getTrialStatusBadge(trial.status)}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="mr-2">容器ID:</span>
                            <span className="font-mono text-xs">{trial.containerId}</span>
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <span className="mr-2">时长:</span>
                            <span className="font-medium">{formatDuration(trial.startedAt, trial.endsAt)}</span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {new Date(trial.startedAt).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
