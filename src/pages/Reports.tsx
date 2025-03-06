import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Download } from 'lucide-react';

const Reports = () => {
  const { transactions, products } = useData();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Only admin can access reports
  if (user?.role !== 'admin') {
    return <div className="text-center py-10">Hanya Admin yang dapat mengakses laporan</div>;
  }

  const getDateRangeTransactions = () => {
    const date = parseISO(selectedDate);
    
    let start: Date, end: Date;
    let rangeLabel = '';
    
    if (dateRange === 'daily') {
      start = startOfDay(date);
      end = endOfDay(date);
      rangeLabel = format(date, 'dd MMMM yyyy', { locale: id });
    } else if (dateRange === 'weekly') {
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
      rangeLabel = `${format(start, 'dd MMM', { locale: id })} - ${format(end, 'dd MMM yyyy', { locale: id })}`;
    } else {
      start = startOfMonth(date);
      end = endOfMonth(date);
      rangeLabel = format(date, 'MMMM yyyy', { locale: id });
    }
    
    const filtered = transactions.filter(transaction => {
      const txDate = parseISO(transaction.createdAt);
      return transaction.status === 'completed' && txDate >= start && txDate <= end;
    });
    
    return { transactions: filtered, start, end, rangeLabel };
  };

  const { transactions: filteredTransactions, rangeLabel } = getDateRangeTransactions();

  const getTotalSales = () => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
  };

  const getProductSales = () => {
    const productMap = new Map<number, { count: number; total: number }>();
    
    filteredTransactions.forEach(tx => {
      tx.items.forEach(item => {
        const existing = productMap.get(item.productId) || { count: 0, total: 0 };
        productMap.set(item.productId, {
          count: existing.count + item.quantity,
          total: existing.total + item.subtotal
        });
      });
    });
    
    const result = Array.from(productMap.entries()).map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        name: product?.name || 'Unknown',
        count: data.count,
        total: data.total
      };
    });
    
    return result.sort((a, b) => b.total - a.total);
  };

  const getServiceSales = () => {
    const serviceMap = new Map<string, { count: number; total: number }>();
    
    filteredTransactions.forEach(tx => {
      tx.services.forEach(service => {
        const existing = serviceMap.get(service.description) || { count: 0, total: 0 };
        serviceMap.set(service.description, {
          count: existing.count + 1,
          total: existing.total + service.price
        });
      });
    });
    
    const result = Array.from(serviceMap.entries()).map(([description, data]) => {
      return {
        description,
        count: data.count,
        total: data.total
      };
    });
    
    return result.sort((a, b) => b.total - a.total);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
  };

  const exportCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "ID,Tanggal,Pelanggan,Total\n";
    
    // Add data rows
    filteredTransactions.forEach(tx => {
      csvContent += `${tx.id},${formatDate(tx.createdAt)},"${tx.customerName || 'Umum'}",${tx.total}\n`;
    });
    
    // Create download link and click it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_${dateRange}_${format(parseISO(selectedDate), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const productSales = getProductSales();
  const serviceSales = getServiceSales();

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <div className="mr-2">
                <Calendar size={20} className="text-gray-500" />
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
            
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={exportCSV}
              className="ml-auto flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={16} className="mr-1" /> Export CSV
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Ringkasan Penjualan: {rangeLabel}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Total Transaksi</div>
                <div className="text-2xl font-bold">{filteredTransactions.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-green-600">Total Penjualan</div>
                <div className="text-2xl font-bold">{formatCurrency(getTotalSales())}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Rata-rata per Transaksi</div>
                <div className="text-2xl font-bold">
                  {filteredTransactions.length > 0 
                    ? formatCurrency(getTotalSales() / filteredTransactions.length) 
                    : formatCurrency(0)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Daftar Transaksi</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">#{tx.id}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(tx.createdAt)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{tx.customerName || 'Umum'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(tx.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                          Tidak ada data transaksi pada periode ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Produk Terlaris</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Terjual</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productSales.length > 0 ? (
                        productSales.map((item) => (
                          <tr key={item.productId}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{item.count}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                            Tidak ada data penjualan produk
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Layanan Terlaris</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceSales.length > 0 ? (
                        serviceSales.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{item.count}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                            Tidak ada data layanan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
