import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ordersApi } from '../../lib/api';

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrder(id);
      setOrder(data.order);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link href="/my-orders" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
          ← 返回订单列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Link
        href="/my-orders"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回订单列表
      </Link>

      {/* Order header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
              <p className="mt-1 text-sm text-gray-500">订单号: {order.orderNumber}</p>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(order.paymentStatus)}
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Skill info */}
          <div className="flex items-start space-x-4 mb-6">
            {order.skill.icon && (
              <img
                src={order.skill.icon}
                alt={order.skill.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{order.skill.name}</h2>
              <p className="text-gray-600 mt-1">{order.skill.description}</p>
            </div>
          </div>

          {/* Order details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">金额</p>
                <p className="text-lg font-semibold text-gray-900">${order.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">支付方式</p>
                <p className="text-gray-900">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">创建时间</p>
                <p className="text-gray-900">
                  {new Date(order.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
              {order.completedAt && (
                <div>
                  <p className="text-sm text-gray-500">完成时间</p>
                  <p className="text-gray-900">
                    {new Date(order.completedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              )}
            </div>

            {order.transactionId && (
              <div>
                <p className="text-sm text-gray-500">交易ID</p>
                <p className="text-gray-900 font-mono text-sm">{order.transactionId}</p>
              </div>
            )}
          </div>

          {/* Author info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">开发者信息</h3>
            <div className="flex items-center space-x-3">
              {order.skill.author.avatar && (
                <img
                  src={order.skill.author.avatar}
                  alt={order.skill.author.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{order.skill.author.name}</p>
                <p className="text-xs text-gray-500">ID: {order.skill.author.id}</p>
              </div>
            </div>
          </div>

          {/* Download link */}
          {order.paymentStatus === 'COMPLETED' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href={order.skill.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载技能
              </a>
              <p className="mt-2 text-sm text-gray-500">文件大小: {(order.skill.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
