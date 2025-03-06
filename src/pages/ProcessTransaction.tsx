import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useData, Transaction } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Check, CircleAlert, LoaderCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';
import Receipt from '../components/Receipt';
import DirectPrintButton from '../components/DirectPrintButton';

const ProcessTransaction = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTransaction, updateTransaction, getProduct, updateStock } = useData();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);
  const [printError, setPrintError] = useState<string>('');
  const [shouldPrintAutomatically, setShouldPrintAutomatically] = useState<boolean>(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const foundTransaction = getTransaction(parseInt(id));
      if (foundTransaction) {
        setTransaction(foundTransaction);
        setCustomerName(foundTransaction.customerName || '');
        // Pre-fill with exact amount
        setAmountPaid(foundTransaction.total.toString());
      } else {
        setError('Transaksi tidak ditemukan');
      }
    }
  }, [id, getTransaction]);

  // This effect triggers automatic printing after transaction completion
  useEffect(() => {
    if (shouldPrintAutomatically && transaction?.status === 'completed') {
      // Add a slight delay to ensure the receipt is fully rendered
      const timer = setTimeout(() => {
        handlePrint();
        setShouldPrintAutomatically(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [shouldPrintAutomatically, transaction]);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${transaction?.id}`,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        setPrintError('');
        setPrintSuccess(false);
        setIsPrinting(true);
        // Give time for the receipt to render properly
        setTimeout(resolve, 500);
      });
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      setPrintSuccess(true);
    },
    onPrintError: (error) => {
      console.error('Print failed:', error);
      setIsPrinting(false);
      setPrintError('Gagal mencetak nota. Silakan coba lagi.');
    },
  });

  const printReceipt = () => {
    setPrintError('');
    setPrintSuccess(false);
    
    // Check if receipt ref is available
    if (!receiptRef.current) {
      setPrintError('Komponen nota tidak ditemukan. Silakan muat ulang halaman.');
      return;
    }
    
    handlePrint();
  };

  const completeTransaction = () => {
    if (!transaction) return;
    
    const paid = parseFloat(amountPaid);
    
    if (isNaN(paid) || paid < transaction.total) {
      setError('Jumlah pembayaran kurang dari total transaksi');
      return;
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'completed',
      completedAt: new Date().toISOString(),
      cashierId: user?.id || 0,
      customerName,
      amountPaid: paid,
      change: paid - transaction.total
    };

    // Update transaction
    updateTransaction(updatedTransaction);
    
    // Update product stock
    transaction.items.forEach(item => {
      updateStock(item.productId, item.quantity);
    });

    setTransaction(updatedTransaction);
    
    // Set flag to print automatically after transaction is completed
    setShouldPrintAutomatically(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  if (user?.role !== 'cashier' && transaction?.status !== 'completed') {
    return <div className="text-center py-10">Hanya Kasir yang dapat memproses pembayaran</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Dashboard
        </button>
      </div>
    );
  }

  if (!transaction) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/')}
          className="mr-4 p-2 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          {transaction.status === 'completed' ? 'Transaksi Selesai' : 'Proses Pembayaran'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {transaction.status === 'pending' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold">Informasi Pembayaran</h2>
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
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama pelanggan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Handphone
                  </label>
                  <div className="p-2 border border-gray-200 rounded-lg bg-gray-50">
                    {transaction.phoneType || 'Tidak ada informasi tipe handphone'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Kerusakan
                  </label>
                  <div className="p-2 border border-gray-200 rounded-lg bg-gray-50">
                    {transaction.damageDescription || 'Tidak ada informasi kerusakan'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Pembayaran
                  </label>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(transaction.total)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Uang Diterima
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => {
                      setAmountPaid(e.target.value);
                      setError('');
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan jumlah yang dibayarkan"
                    min={transaction.total}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                {amountPaid && !isNaN(parseFloat(amountPaid)) && parseFloat(amountPaid) >= transaction.total && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kembalian
                    </label>
                    <div className="text-xl font-semibold">
                      {formatCurrency(parseFloat(amountPaid) - transaction.total)}
                    </div>
                  </div>
                )}

                <button
                  onClick={completeTransaction}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-4"
                  disabled={!amountPaid || isNaN(parseFloat(amountPaid)) || parseFloat(amountPaid) < transaction.total}
                >
                  Selesaikan Pembayaran
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-green-100 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil</h2>
                <p className="text-gray-600 mb-4">
                  Transaksi telah selesai pada {formatDate(transaction.completedAt || '')}
                </p>
                
                {/* Use the new DirectPrintButton component */}
                <DirectPrintButton transaction={transaction} cashierName={user?.name || 'Kasir'} />
                
                {/* Keep old printing mechanism as fallback */}
                <div className="hidden">
                  {printSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm flex items-center">
                      <Check size={16} className="mr-2" />
                      Nota berhasil dicetak!
                    </div>
                  )}
                  
                  {printError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
                      <CircleAlert size={16} className="mr-2" />
                      {printError}
                    </div>
                  )}
                  
                  <button
                    onClick={printReceipt}
                    disabled={isPrinting}
                    className="mt-2 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    {isPrinting ? (
                      <>
                        <LoaderCircle size={16} className="mr-2 animate-spin" /> Menyiapkan Nota...
                      </>
                    ) : (
                      <>
                        <Printer size={16} className="mr-2" /> Cetak Dengan react-to-print
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 border-t">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Total</div>
                  <div className="font-semibold">{formatCurrency(transaction.total)}</div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Dibayar</div>
                  <div className="font-semibold">{formatCurrency(transaction.amountPaid || 0)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-gray-600">Kembalian</div>
                  <div className="font-semibold">{formatCurrency(transaction.change || 0)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">Detail Transaksi</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-3 mb-4">
                <h3 className="font-medium">Produk</h3>
                {transaction.items.length > 0 ? (
                  <div className="space-y-2">
                    {transaction.items.map((item) => {
                      const product = getProduct(item.productId);
                      return (
                        <div key={item.productId} className="flex justify-between">
                          <div>
                            <div className="font-medium">{product?.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(item.price)} x {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">{formatCurrency(item.subtotal)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 py-2">Tidak ada produk</div>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <h3 className="font-medium">Layanan</h3>
                {transaction.services.length > 0 ? (
                  <div className="space-y-2">
                    {transaction.services.map((service, index) => (
                      <div key={index} className="flex justify-between">
                        <div>{service.description}</div>
                        <div>{formatCurrency(service.price)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 py-2">Tidak ada layanan</div>
                )}
              </div>
              
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <div>Total</div>
                  <div>{formatCurrency(transaction.total)}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Preview Receipt for completed transactions */}
          {transaction.status === 'completed' && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-3 text-center">Preview Struk</h3>
              <div className="border rounded-lg p-3 max-h-[500px] overflow-y-auto">
                <div className="receipt-wrapper mx-auto">
                  <Receipt transaction={transaction} cashierName={user?.name || 'Kasir'} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Receipt for printing with react-to-print */}
      <div className="hidden">
        <div ref={receiptRef} className="receipt-wrapper">
          {transaction && <Receipt transaction={transaction} cashierName={user?.name || 'Kasir'} />}
        </div>
      </div>
    </div>
  );
};

export default ProcessTransaction;
