import { Transaction } from '../contexts/DataContext';
import { format } from 'date-fns';
import { useData } from '../contexts/DataContext';
import { useStoreProfile } from '../contexts/StoreProfileContext';
import { Phone, Smartphone, Wrench } from 'lucide-react';

interface ReceiptProps {
  transaction: Transaction;
  cashierName: string;
}

const Receipt = ({ transaction, cashierName }: ReceiptProps) => {
  const { getProduct } = useData();
  const { storeProfile } = useStoreProfile();

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

  return (
    <div className="receipt-container">
      {/* Receipt Header */}
      <div className="receipt-header">
        <div className="receipt-logo">
          <Smartphone size={32} className="receipt-icon" />
        </div>
        <h1 className="receipt-title">{storeProfile.name}</h1>
        <p className="receipt-address">{storeProfile.address}, {storeProfile.city}</p>
        <p className="receipt-contact">Telp: {storeProfile.phone}</p>
        <div className="receipt-divider"></div>
        <h2 className="receipt-label">NOTA SERVIS</h2>
        <div className="receipt-divider"></div>
      </div>

      {/* Transaction Info */}
      <div className="receipt-transaction-info">
        <div className="receipt-row">
          <span className="receipt-label">No. Transaksi:</span>
          <span className="receipt-value">#{transaction.id}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Tanggal:</span>
          <span className="receipt-value">{formatDate(transaction.completedAt || transaction.createdAt)}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Kasir:</span>
          <span className="receipt-value">{cashierName}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Pelanggan:</span>
          <span className="receipt-value">{transaction.customerName || 'Umum'}</span>
        </div>
      </div>
      
      {/* Phone Information */}
      {(transaction.phoneType || transaction.damageDescription) && (
        <div className="receipt-repair-info">
          <div className="receipt-section-title">
            <Phone size={12} className="mr-1" />
            <span>INFORMASI HANDPHONE</span>
          </div>
          {transaction.phoneType && (
            <div className="receipt-row">
              <span className="receipt-label">Tipe:</span>
              <span className="receipt-value">{transaction.phoneType}</span>
            </div>
          )}
          {transaction.damageDescription && (
            <div className="receipt-row">
              <span className="receipt-label">Kerusakan:</span>
              <span className="receipt-value">{transaction.damageDescription}</span>
            </div>
          )}
        </div>
      )}

      {/* Products */}
      {transaction.items.length > 0 && (
        <div className="receipt-products">
          <div className="receipt-section-title">
            <Smartphone size={12} className="mr-1" />
            <span>DETAIL PRODUK</span>
          </div>
          <div className="receipt-divider thin"></div>
          <div className="receipt-item-header">
            <span className="item-name">Item</span>
            <span className="item-qty">Qty</span>
            <span className="item-price">Harga</span>
          </div>
          <div className="receipt-divider thin"></div>
          {transaction.items.map((item) => {
            const product = getProduct(item.productId);
            return (
              <div key={item.productId} className="receipt-item">
                <div className="item-name">{product?.name}</div>
                <div className="item-details">
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-price">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Services */}
      {transaction.services.length > 0 && (
        <div className="receipt-services">
          <div className="receipt-section-title">
            <Wrench size={12} className="mr-1" />
            <span>DETAIL LAYANAN</span>
          </div>
          <div className="receipt-divider thin"></div>
          {transaction.services.map((service, index) => (
            <div key={index} className="receipt-item">
              <span className="item-name">{service.description}</span>
              <span className="item-price">{formatCurrency(service.price)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Payment Info */}
      <div className="receipt-payment">
        <div className="receipt-divider"></div>
        <div className="receipt-row total">
          <span className="receipt-label">Total:</span>
          <span className="receipt-value">{formatCurrency(transaction.total)}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Tunai:</span>
          <span className="receipt-value">{formatCurrency(transaction.amountPaid || 0)}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Kembalian:</span>
          <span className="receipt-value">{formatCurrency(transaction.change || 0)}</span>
        </div>
        <div className="receipt-divider"></div>
      </div>

      {/* Footer */}
      <div className="receipt-footer">
        <p>Terima kasih atas kunjungan Anda</p>
        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
        <p>*Garansi servis 7 hari*</p>
      </div>
    </div>
  );
};

export default Receipt;
