import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData, Product, TransactionItem, ServiceItem } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Trash2 } from 'lucide-react';

const CreateTransaction = () => {
  const { products, createTransaction, getTransaction, getProduct } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewTransactionId = queryParams.get('view') ? parseInt(queryParams.get('view') || '0') : null;

  const [customerName, setCustomerName] = useState('');
  const [phoneType, setPhoneType] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [newService, setNewService] = useState({ description: '', price: 0 });
  const [viewMode, setViewMode] = useState(false);
  const [error, setError] = useState('');

  // Load transaction if in view mode
  useEffect(() => {
    if (viewTransactionId) {
      const transaction = getTransaction(viewTransactionId);
      if (transaction) {
        setViewMode(true);
        setCustomerName(transaction.customerName || '');
        setPhoneType(transaction.phoneType || '');
        setDamageDescription(transaction.damageDescription || '');
        setItems(transaction.items);
        setServices(transaction.services);
      }
    }
  }, [viewTransactionId, getTransaction]);

  const addItem = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      setItems(
        items.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price
              }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          quantity: 1,
          price: product.price,
          subtotal: product.price
        }
      ]);
    }
  };

  const removeItem = (productId: number) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    const product = getProduct(productId);
    if (!product) return;
    
    setItems(
      items.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.price
            }
          : item
      )
    );
  };

  const addService = () => {
    if (newService.description.trim() === '' || newService.price <= 0) return;
    
    setServices([...services, { ...newService }]);
    setNewService({ description: '', price: 0 });
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const servicesTotal = services.reduce((sum, service) => sum + service.price, 0);
    return itemsTotal + servicesTotal;
  };

  const handleSubmit = () => {
    setError('');

    if (!customerName.trim()) {
      setError('Mohon masukkan nama pelanggan');
      return;
    }

    if (!phoneType.trim()) {
      setError('Mohon masukkan tipe handphone');
      return;
    }

    if (!damageDescription.trim()) {
      setError('Mohon masukkan deskripsi kerusakan');
      return;
    }

    if (items.length === 0 && services.length === 0) {
      setError('Transaksi harus memiliki minimal 1 produk atau layanan');
      return;
    }

    const transactionId = createTransaction({
      items,
      services,
      total: calculateTotal(),
      technicianId: user?.id || 0,
      customerName,
      phoneType,
      damageDescription
    });

    alert('Transaksi berhasil dibuat!');
    navigate('/');
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (user?.role !== 'technician' && !viewMode) {
    return <div className="text-center py-10">Hanya Teknisi yang dapat membuat transaksi baru</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {viewMode ? 'Detail Transaksi' : 'Buat Transaksi Baru'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Product selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">Informasi Pelanggan</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={viewMode}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama pelanggan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Handphone
                </label>
                <input
                  type="text"
                  value={phoneType}
                  onChange={(e) => setPhoneType(e.target.value)}
                  disabled={viewMode}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Samsung Galaxy A51, iPhone 11, dll"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Kerusakan
                </label>
                <textarea
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  disabled={viewMode}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jelaskan kerusakan yang dialami handphone"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {!viewMode && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => addItem(product)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">Stok: {product.stock}</div>
                    <div className="text-blue-600 font-medium mt-1">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-4">
                    Tidak ada produk yang sesuai dengan pencarian
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold">Daftar Layanan Servis</h2>
              {!viewMode && (
                <button
                  onClick={() => setNewService({ description: '', price: 0 })}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Tambah Layanan
                </button>
              )}
            </div>
            
            {!viewMode && newService && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Deskripsi layanan"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Harga"
                      min="0"
                    />
                  </div>
                  <div>
                    <button
                      onClick={addService}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 w-full md:w-auto"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4">
              {services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{service.description}</div>
                        <div className="text-blue-600">{formatCurrency(service.price)}</div>
                      </div>
                      {!viewMode && (
                        <button
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-3">
                  Belum ada layanan servis ditambahkan
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Cart summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">Ringkasan Transaksi</h2>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium mb-2">Produk</h3>
              {items.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const product = getProduct(item.productId);
                    return (
                      <div key={item.productId} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{product?.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(item.price)} x 
                            {viewMode ? (
                              <span className="ml-1">{item.quantity}</span>
                            ) : (
                              <input
                                type="number"
                                min="1"
                                max={product?.stock || 99}
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value))}
                                className="ml-1 w-12 p-0 border border-gray-300 rounded text-center"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-2">{formatCurrency(item.subtotal)}</div>
                          {!viewMode && (
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-2 mb-4">
                  Belum ada produk dipilih
                </div>
              )}
              
              <h3 className="font-medium mb-2">Layanan</h3>
              {services.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="text-sm">{service.description}</div>
                      <div>{formatCurrency(service.price)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-2 mb-4">
                  Belum ada layanan ditambahkan
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <div>Total</div>
                  <div>{formatCurrency(calculateTotal())}</div>
                </div>
              </div>
              
              {!viewMode && (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-4"
                  disabled={items.length === 0 && services.length === 0}
                >
                  Buat Transaksi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction;
