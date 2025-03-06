import { useEffect, useState } from 'react';
import { format, subDays, subMonths, parseISO, differenceInDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useData, Transaction } from '../contexts/DataContext';
import { Activity, ArrowDownRight, ArrowUpRight, Banknote, ChevronRight, Clock, Printer, ShoppingBag, Smartphone, Tag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SalesChart from '../components/SalesChart';
import CashierPanel from '../components/CashierPanel';

type ChartPeriod = 'daily' | 'weekly' | 'monthly';

const Dashboard = () => {
  const { user } = useAuth();
  const { products, categories, transactions } = useData();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('daily');
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Generate chart data based on period
  useEffect(() => {
    generateChartData();
  }, [chartPeriod, transactions]);

  const generateChartData = () => {
    const completedTransactions = transactions.filter(tx => tx.status === 'completed');
    let data: any[] = [];
    
    if (chartPeriod === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTransactions = completedTransactions.filter(tx => 
          tx.completedAt?.startsWith(dateStr)
        );
        
        const previousDate = subDays(date, 7);
        const previousDateStr = format(previousDate, 'yyyy-MM-dd');
        const previousDayTransactions = completedTransactions.filter(tx => 
          tx.completedAt?.startsWith(previousDateStr)
        );

        data.push({
          name: format(date, 'dd MMM'),
          total: dayTransactions.reduce((sum, tx) => sum + tx.total, 0),
          sparepartSales: calculateCategorySales(dayTransactions, 1), // Sparepart category ID
          serviceSales: calculateServiceSales(dayTransactions),
          previousPeriod: previousDayTransactions.reduce((sum, tx) => sum + tx.total, 0)
        });
      }
    } else if (chartPeriod === 'weekly') {
      // Last 6 weeks
      for (let i = 5; i >= 0; i--) {
        const startDate = subDays(new Date(), i * 7 + 6);
        const endDate = subDays(new Date(), i * 7);
        const weekTransactions = completedTransactions.filter(tx => {
          const txDate = tx.completedAt ? parseISO(tx.completedAt) : null;
          return txDate && txDate >= startDate && txDate <= endDate;
        });
        
        const previousStartDate = subDays(startDate, 42); // 6 weeks ago
        const previousEndDate = subDays(endDate, 42);
        const previousWeekTransactions = completedTransactions.filter(tx => {
          const txDate = tx.completedAt ? parseISO(tx.completedAt) : null;
          return txDate && txDate >= previousStartDate && txDate <= previousEndDate;
        });

        data.push({
          name: `W${i+1}`,
          total: weekTransactions.reduce((sum, tx) => sum + tx.total, 0),
          sparepartSales: calculateCategorySales(weekTransactions, 1),
          serviceSales: calculateServiceSales(weekTransactions),
          previousPeriod: previousWeekTransactions.reduce((sum, tx) => sum + tx.total, 0)
        });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStr = format(date, 'yyyy-MM');
        const monthTransactions = completedTransactions.filter(tx => 
          tx.completedAt?.startsWith(monthStr)
        );
        
        const previousDate = subMonths(date, 6);
        const previousMonthStr = format(previousDate, 'yyyy-MM');
        const previousMonthTransactions = completedTransactions.filter(tx => 
          tx.completedAt?.startsWith(previousMonthStr)
        );

        data.push({
          name: format(date, 'MMM'),
          total: monthTransactions.reduce((sum, tx) => sum + tx.total, 0),
          sparepartSales: calculateCategorySales(monthTransactions, 1),
          serviceSales: calculateServiceSales(monthTransactions),
          previousPeriod: previousMonthTransactions.reduce((sum, tx) => sum + tx.total, 0)
        });
      }
    }
    
    setChartData(data);
  };

  const calculateCategorySales = (txList: Transaction[], categoryId: number) => {
    let total = 0;
    
    txList.forEach(tx => {
      tx.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.categoryId === categoryId) {
          total += item.subtotal;
        }
      });
    });
    
    return total;
  };

  const calculateServiceSales = (txList: Transaction[]) => {
    return txList.reduce((sum, tx) => 
      sum + tx.services.reduce((sSum, s) => sSum + s.price, 0)
    , 0);
  };

  // Calculate statistics
  const pendingTransactions = transactions.filter(
    (transaction) => transaction.status === 'pending'
  );
  
  const todayTransactions = transactions.filter((transaction) => {
    const today = new Date().toISOString().split('T')[0];
    return transaction.createdAt.startsWith(today) && transaction.status === 'completed';
  });
  
  const todaySales = todayTransactions.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );

  // Comparison with previous day
  const yesterdayTransactions = transactions.filter((transaction) => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    return transaction.createdAt.startsWith(yesterday) && transaction.status === 'completed';
  });
  
  const yesterdaySales = yesterdayTransactions.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );

  const salesChange = yesterdaySales > 0 
    ? ((todaySales - yesterdaySales) / yesterdaySales) * 100
    : todaySales > 0 ? 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 shadow-sm text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-lg">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold">{products.length}</h2>
              <p className="text-primary-100 text-sm">Total Produk</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg p-6 shadow-sm text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-lg">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold">{categories.length}</h2>
              <p className="text-secondary-100 text-sm">Total Kategori</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg p-6 shadow-sm text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold">{transactions.filter(t => t.status === 'completed').length}</h2>
              <p className="text-accent-100 text-sm">Total Transaksi</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 shadow-sm text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold">3</h2>
              <p className="text-purple-200 text-sm">Total Pengguna</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <SalesChart 
          data={chartData}
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="font-semibold">Penjualan Hari Ini</h2>
            <div className="flex items-center">
              <span className={`text-lg font-semibold ${
                salesChange >= 0 ? 'text-accent-600' : 'text-red-600'
              }`}>
                {formatCurrency(todaySales)}
              </span>
              {salesChange !== 0 && (
                <span className={`ml-2 flex items-center text-xs px-2 py-1 rounded-full ${
                  salesChange >= 0 
                    ? 'bg-accent-100 text-accent-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {salesChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(salesChange).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {todayTransactions.length > 0 ? (
                todayTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{transaction.customerName || 'Pelanggan'}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary-600">{formatCurrency(transaction.total)}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.items.length} item, {transaction.services.length} servis
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 py-2 text-center">Belum ada transaksi hari ini</p>
              )}
            </div>
            
            {todayTransactions.length > 5 && (
              <div className="mt-4 text-center">
                <Link to="/reports" className="text-primary-600 text-sm hover:underline flex items-center justify-center">
                  Lihat semua transaksi <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="font-semibold">Produk Stok Rendah</h2>
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              Perlu restock
            </span>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {products.filter(p => p.stock < 5).length > 0 ? (
                products
                  .filter(p => p.stock < 5)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Stok: {product.stock}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 py-2 text-center">Semua produk memiliki stok yang cukup</p>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/products" className="text-primary-600 text-sm hover:underline flex items-center justify-center">
                Kelola produk <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderTechnicianDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-white bg-opacity-30 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-primary-100 text-sm">Total Transaksi</p>
                <h3 className="text-2xl font-bold">
                  {transactions.filter(t => t.technicianId === user?.id).length}
                </h3>
              </div>
            </div>
            <Link 
              to="/create-transaction" 
              className="block w-full bg-white text-primary-600 text-center py-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Buat Transaksi Baru
            </Link>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-accent-500 to-accent-600 text-white">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-white bg-opacity-30 p-3 rounded-full">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-accent-100 text-sm">Transaksi Selesai</p>
                <h3 className="text-2xl font-bold">
                  {transactions.filter(t => t.technicianId === user?.id && t.status === 'completed').length}
                </h3>
              </div>
            </div>
            <div className="w-full bg-white bg-opacity-20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full" 
                style={{ 
                  width: `${
                    transactions.filter(t => t.technicianId === user?.id).length > 0 
                      ? (transactions.filter(t => t.technicianId === user?.id && t.status === 'completed').length / 
                         transactions.filter(t => t.technicianId === user?.id).length) * 100 
                      : 0
                  }%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-secondary-500 to-secondary-600 text-white">
          <div className="p-6">
            <div className="flex items-center mb-1">
              <div className="bg-white bg-opacity-30 p-3 rounded-full">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-secondary-100 text-sm">Total Pendapatan</p>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(
                    transactions
                      .filter(t => t.technicianId === user?.id && t.status === 'completed')
                      .reduce((sum, t) => sum + t.total, 0)
                  )}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header flex justify-between items-center">
          <h2 className="font-semibold">Transaksi Terbaru</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {transactions
              .filter(t => t.technicianId === user?.id)
              .slice(0, 5)
              .map((transaction) => (
                <div key={transaction.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-accent-100 text-accent-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Selesai' : 'Menunggu Pembayaran'}
                      </span>
                      <p className="mt-1 font-medium">
                        {transaction.customerName || 'Pelanggan'} - {formatCurrency(transaction.total)}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <Link 
                      to={`/create-transaction?view=${transaction.id}`}
                      className="btn btn-outline flex items-center py-1.5"
                    >
                      Detail <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang, {user?.name || 'Pengguna'}
        </p>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'technician' && renderTechnicianDashboard()}
      {user?.role === 'cashier' && <CashierPanel />}
    </div>
  );
};

export default Dashboard;
