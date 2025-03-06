import { useState } from 'react';
import { Check, CircleAlert, LoaderCircle, Printer } from 'lucide-react';
import { Transaction } from '../contexts/DataContext';
import { useStoreProfile } from '../contexts/StoreProfileContext';

interface DirectPrintButtonProps {
  transaction: Transaction;
  cashierName: string;
}

const DirectPrintButton = ({ transaction, cashierName }: DirectPrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [printError, setPrintError] = useState('');
  const { storeProfile } = useStoreProfile();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const printDirectly = () => {
    setIsPrinting(true);
    setPrintError('');
    setPrintSuccess(false);
    
    try {
      // Create an invisible iframe to hold the receipt content
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-9999px';
      printFrame.style.left = '-9999px';
      document.body.appendChild(printFrame);
      
      // Generate receipt HTML content
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0 auto;
              padding: 5mm;
              box-sizing: border-box;
              text-align: center;
            }
            .receipt-container {
              width: 100%;
              text-align: center;
              line-height: 1.2;
              font-size: 12px;
            }
            .receipt-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 2px;
            }
            .receipt-address, .receipt-contact {
              font-size: 10px;
              margin: 2px 0;
            }
            .receipt-divider {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
            .receipt-label {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 4px 0;
            }
            .receipt-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              line-height: 1.2;
            }
            .receipt-row.total {
              font-weight: bold;
              font-size: 14px;
            }
            .receipt-footer {
              font-size: 10px;
              margin-top: 10px;
              text-align: center;
            }
            .receipt-item {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                width: 80mm;
                margin: 0 auto;
                padding: 5mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <h1 class="receipt-title">${storeProfile.name}</h1>
              <p class="receipt-address">${storeProfile.address}, ${storeProfile.city}</p>
              <p class="receipt-contact">Telp: ${storeProfile.phone}</p>
              <div class="receipt-divider"></div>
              <h2 class="receipt-label">NOTA SERVIS</h2>
              <div class="receipt-divider"></div>
            </div>

            <div style="text-align: left;">
              <div class="receipt-row">
                <span class="receipt-label">No:</span>
                <span class="receipt-value">#${transaction.id}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Tanggal:</span>
                <span class="receipt-value">${new Date(transaction.completedAt || transaction.createdAt).toLocaleDateString('id-ID')} ${new Date(transaction.completedAt || transaction.createdAt).toLocaleTimeString('id-ID')}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Kasir:</span>
                <span class="receipt-value">${cashierName}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Pelanggan:</span>
                <span class="receipt-value">${transaction.customerName || 'Umum'}</span>
              </div>
              
              ${transaction.phoneType ? `
              <div class="receipt-divider"></div>
              <div class="receipt-row">
                <span class="receipt-label">Tipe HP:</span>
                <span class="receipt-value">${transaction.phoneType}</span>
              </div>` : ''}
              
              ${transaction.damageDescription ? `
              <div class="receipt-row">
                <span class="receipt-label">Kerusakan:</span>
                <span class="receipt-value">${transaction.damageDescription}</span>
              </div>` : ''}
            </div>

            ${transaction.items.length > 0 ? `
            <div class="receipt-divider"></div>
            <div style="text-align: left;">
              <div class="receipt-label">PRODUK</div>
              <div class="receipt-divider" style="border-top: 1px solid #ddd;"></div>
              ${transaction.items.map(item => `
                <div class="receipt-item">
                  <div style="flex-grow: 1;">${item.productId} x${item.quantity}</div>
                  <div>${formatCurrency(item.subtotal)}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${transaction.services.length > 0 ? `
            <div class="receipt-divider"></div>
            <div style="text-align: left;">
              <div class="receipt-label">LAYANAN</div>
              <div class="receipt-divider" style="border-top: 1px solid #ddd;"></div>
              ${transaction.services.map(service => `
                <div class="receipt-item">
                  <div style="flex-grow: 1;">${service.description}</div>
                  <div>${formatCurrency(service.price)}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div class="receipt-divider"></div>
            <div class="receipt-row total">
              <span class="receipt-label">Total:</span>
              <span class="receipt-value">${formatCurrency(transaction.total)}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Tunai:</span>
              <span class="receipt-value">${formatCurrency(transaction.amountPaid || 0)}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Kembalian:</span>
              <span class="receipt-value">${formatCurrency(transaction.change || 0)}</span>
            </div>
            <div class="receipt-divider"></div>

            <div class="receipt-footer">
              <p>Terima kasih atas kunjungan Anda</p>
              <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
              <p>*Garansi servis 7 hari*</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const iframeWindow = printFrame.contentWindow!;
      iframeWindow.document.open();
      iframeWindow.document.write(receiptContent);
      iframeWindow.document.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        try {
          iframeWindow.focus();
          iframeWindow.print();
          
          // Clean up after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
            setIsPrinting(false);
            setPrintSuccess(true);
          }, 1000);
        } catch (err) {
          console.error('Print error:', err);
          document.body.removeChild(printFrame);
          setIsPrinting(false);
          setPrintError('Gagal mencetak nota. Pastikan printer terhubung.');
        }
      }, 500);
      
    } catch (err) {
      console.error('Print setup error:', err);
      setIsPrinting(false);
      setPrintError('Gagal menyiapkan nota untuk dicetak.');
    }
  };

  return (
    <div>
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
        onClick={printDirectly}
        disabled={isPrinting}
        className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
          isPrinting ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isPrinting ? (
          <>
            <LoaderCircle size={16} className="mr-2 animate-spin" /> Menyiapkan Nota...
          </>
        ) : (
          <>
            <Printer size={16} className="mr-2" /> {printSuccess ? 'Cetak Nota Lagi' : 'Cetak Nota'}
          </>
        )}
      </button>
    </div>
  );
};

export default DirectPrintButton;
