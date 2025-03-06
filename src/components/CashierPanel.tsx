import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, Transaction } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { CircleAlert, ArrowRight, Clock, CreditCard, DollarSign, Search, ShoppingBag } from 'lucide-react';

const CashierPanel = () => {
  const { transactions } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    // Filter transactions to get pending ones
    const pending = transactions
      .filter(t => t.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Filter to get today's completed transactions
    const today = new Date().toISOString().split('T')[0];
    const completed = transactions
      .filter(t => t.status === 'completed' && t.completedAt?.startsWith(today))
      .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime());
    
    setPendingTransactions(pending);
    setCompletedTransactions(completed);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'HH:mm');
  };

  const handleProcessTransaction = (id: number) => {
    navigate(`/process-transaction/${id}`);
  };

  const getFilteredTransactions = () => {
    const transactionsToFilter = activeTab === 'pending' ? pendingTransactions : completedTransactions;
    
    if (!searchTerm) return transactionsToFilter;
    
    return transactionsToFilter.filter(t => {
      const customerNameMatch = t.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = t.id.toString().includes(searchTerm);
      const phoneTypeMatch = t.phoneType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return customerNameMatch || idMatch || phoneTypeMatch;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const todayTotal = completedTransactions.reduce((sum, t) => sum + t.total, 0);

  return (
    <div>
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Transaksi Tertunda</p>
              <h3 className="text-2xl font-bold">{pendingTransactions.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Penjualan Hari Ini</p>
              <h3 className="text-2xl font-bold">{formatCurrency(todayTotal)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Transaksi Hari Ini</p>
              <h3 className="text-2xl font-bold">{completedTransactions.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-lg font-semibold">Transaksi</h2>
              
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 text-sm flex items-center ${
                    activeTab === 'pending' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Clock size={16} className="mr-1" /> Tertunda ({pendingTransactions.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1.5 text-sm flex items-center ${
                    activeTab === 'completed' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard size={16} className="mr-1" /> Selesai ({completedTransactions.length})
                </button>
              </div>
            </div>
            
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(transaction => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="sm:flex justify-between items-center">
                  <div>
                    <div className="flex items-center mb-1">
                      {activeTab === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                          <Clock size={12} className="mr-1" /> Menunggu
                        </span>
                      )}
                      <span className="text-lg font-medium">
                        {transaction.customerName || 'Pelanggan Umum'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-2">
                      #{transaction.id} • {formatDate(transaction.createdAt)} • 
                      {transaction.phoneType ? ` ${transaction.phoneType}` : ' Tidak ada data tipe HP'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <ShoppingBag size={14} className="mr-1" />
                      <span>
                        {transaction.items.length} produk, {transaction.services.length} layanan
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end mt-3 sm:mt-0">
                    <div className="text-lg font-bold text-primary-600 mb-2">
                      {formatCurrency(transaction.total)}
                    </div>
                    
                    {activeTab === 'pending' ? (
                      <button
                        onClick={() => handleProcessTransaction(transaction.id)}
                        className="bg-primary-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                      >
                        Proses Pembayaran <ArrowRight size={14} className="ml-1" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleProcessTransaction(transaction.id)}
                        className="bg-gray-100 text-gray-700 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                      >
                        Lihat Detail <ArrowRight size={14} className="ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center">
              {activeTab === 'pending' ? (
                <div className="flex flex-col items-center">
                  <CircleAlert size={36} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">Tidak ada transaksi tertunda</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <CircleAlert size={36} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">Belum ada transaksi selesai hari ini</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierPanel;
