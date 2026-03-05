import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        欢迎来到技能市场
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        发现、购买和使用技能
      </p>
      <div className="flex justify-center space-x-4">
        <Link
          href="/my-orders"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          我的订单
        </Link>
        <Link
          href="/my-skills"
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          我的技能
        </Link>
      </div>
    </div>
  );
}
