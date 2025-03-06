import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { addDays, format, subDays, subHours } from 'date-fns'

// Initialize localStorage with default data if empty
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    { id: 2, username: 'teknisi', password: 'teknisi123', role: 'technician', name: 'Teknisi' },
    { id: 3, username: 'kasir', password: 'kasir123', role: 'cashier', name: 'Kasir' }
  ]));
}

if (!localStorage.getItem('categories')) {
  localStorage.setItem('categories', JSON.stringify([
    { id: 1, name: 'Sparepart' },
    { id: 2, name: 'Aksesoris' },
    { id: 3, name: 'Layanan Servis' },
    { id: 4, name: 'Komponen Internal' },
    { id: 5, name: 'Software' }
  ]));
}

if (!localStorage.getItem('products')) {
  localStorage.setItem('products', JSON.stringify([
    // Spareparts
    { id: 1, name: 'LCD Samsung A51', price: 850000, stock: 10, categoryId: 1 },
    { id: 2, name: 'Baterai iPhone 11', price: 550000, stock: 15, categoryId: 1 },
    { id: 3, name: 'LCD iPhone X', price: 1200000, stock: 5, categoryId: 1 },
    { id: 4, name: 'Baterai Samsung S20', price: 450000, stock: 20, categoryId: 1 },
    { id: 5, name: 'Konektor Charging Xiaomi', price: 120000, stock: 30, categoryId: 1 },
    { id: 6, name: 'Touchscreen Oppo F11', price: 350000, stock: 8, categoryId: 1 },
    { id: 7, name: 'Kamera Belakang Vivo Y12', price: 280000, stock: 12, categoryId: 1 },
    { id: 8, name: 'Buzzer Realme 5', price: 80000, stock: 25, categoryId: 1 },
    { id: 9, name: 'Flex Power iPhone 12', price: 220000, stock: 7, categoryId: 1 },
    { id: 10, name: 'Mesin Fingerprint Xiaomi Redmi 9', price: 190000, stock: 9, categoryId: 1 },
    
    // Aksesoris
    { id: 11, name: 'Tempered Glass', price: 50000, stock: 50, categoryId: 2 },
    { id: 12, name: 'Casing iPhone 13', price: 120000, stock: 20, categoryId: 2 },
    { id: 13, name: 'Softcase Samsung A52', price: 75000, stock: 35, categoryId: 2 },
    { id: 14, name: 'Holder HP', price: 45000, stock: 40, categoryId: 2 },
    { id: 15, name: 'Kabel Data USB Type-C', price: 35000, stock: 60, categoryId: 2 },
    { id: 16, name: 'Charger Fast Charging', price: 90000, stock: 25, categoryId: 2 },
    { id: 17, name: 'Earphone Bluetooth', price: 150000, stock: 15, categoryId: 2 },
    { id: 18, name: 'Pop Socket', price: 25000, stock: 70, categoryId: 2 },
    
    // Komponen Internal
    { id: 19, name: 'IC Power iPhone 8', price: 300000, stock: 6, categoryId: 4 },
    { id: 20, name: 'Mesin Power Samsung A71', price: 275000, stock: 4, categoryId: 4 },
    { id: 21, name: 'Antena Signal Oppo Reno', price: 120000, stock: 10, categoryId: 4 },
    { id: 22, name: 'Chip Audio Vivo V20', price: 180000, stock: 8, categoryId: 4 },
    
    // Software
    { id: 23, name: 'Jasa Flash ROM', price: 100000, stock: 999, categoryId: 5 },
    { id: 24, name: 'Backup Data', price: 75000, stock: 999, categoryId: 5 },
    { id: 25, name: 'Instalasi Aplikasi', price: 50000, stock: 999, categoryId: 5 }
  ]));
}

// Generate dummy transactions if none exist
if (!localStorage.getItem('transactions')) {
  const now = new Date();
  
  const createTransaction = (id, date, status, customerId, customerName, phoneType, damageDescription, items, services, technicianId, cashierId = undefined, amountPaid = undefined, change = undefined) => {
    const total = [...items.map(i => i.subtotal), ...services.map(s => s.price)].reduce((sum, val) => sum + val, 0);
    
    return {
      id,
      items,
      services,
      total,
      status,
      createdAt: date.toISOString(),
      completedAt: status === 'completed' ? date.toISOString() : undefined,
      technicianId,
      cashierId,
      customerName,
      phoneType,
      damageDescription,
      amountPaid,
      change
    };
  };
  
  const transactions = [
    // Completed transactions from the past
    createTransaction(
      1741123371251,
      subDays(now, 3),
      'completed',
      101,
      'Budi Santoso',
      'iPhone 11 Pro',
      'Layar retak dan baterai cepat habis',
      [
        { productId: 3, quantity: 1, price: 1200000, subtotal: 1200000 },
        { productId: 2, quantity: 1, price: 550000, subtotal: 550000 }
      ],
      [
        { description: 'Penggantian LCD dan Baterai', price: 150000 }
      ],
      2, // teknisi
      3, // kasir
      2000000,
      100000
    ),
    
    createTransaction(
      1741123371252,
      subDays(now, 2),
      'completed',
      102,
      'Siti Rahayu',
      'Samsung S21',
      'Tidak bisa charging, port rusak',
      [
        { productId: 5, quantity: 1, price: 120000, subtotal: 120000 }
      ],
      [
        { description: 'Penggantian port charging', price: 100000 }
      ],
      2,
      3,
      250000,
      30000
    ),
    
    createTransaction(
      1741123371253,
      subDays(now, 1),
      'completed',
      103,
      'Anwar Ibrahim',
      'Xiaomi Redmi Note 9',
      'Kamera belakang buram',
      [
        { productId: 7, quantity: 1, price: 280000, subtotal: 280000 }
      ],
      [
        { description: 'Penggantian kamera belakang', price: 80000 }
      ],
      2,
      3,
      400000,
      40000
    ),
    
    // Transaction from earlier today
    createTransaction(
      1741123371254,
      subHours(now, 5),
      'completed',
      104,
      'Dewi Lestari',
      'Oppo F11',
      'Touchscreen tidak responsif',
      [
        { productId: 6, quantity: 1, price: 350000, subtotal: 350000 },
        { productId: 11, quantity: 1, price: 50000, subtotal: 50000 }
      ],
      [
        { description: 'Penggantian touchscreen', price: 100000 }
      ],
      2,
      3,
      550000,
      50000
    ),
    
    // Pending transactions (today)
    createTransaction(
      1741123371255,
      subHours(now, 2),
      'pending',
      105,
      'Ahmad Susanto',
      'iPhone 12',
      'Speaker tidak bersuara dan tombol power macet',
      [
        { productId: 9, quantity: 1, price: 220000, subtotal: 220000 }
      ],
      [
        { description: 'Perbaikan speaker', price: 150000 },
        { description: 'Penggantian tombol power', price: 100000 }
      ],
      2
    ),
    
    createTransaction(
      1741123371256,
      subHours(now, 1),
      'pending',
      106,
      'Rina Marlina',
      'Vivo Y12',
      'Baterai cepat habis dan HP sering restart',
      [
        { productId: 4, quantity: 1, price: 450000, subtotal: 450000 }
      ],
      [
        { description: 'Penggantian baterai', price: 80000 },
        { description: 'Perbaikan sistem', price: 100000 }
      ],
      2
    ),
    
    // Future date transaction - for testing
    createTransaction(
      1741123371257,
      addDays(now, 1),
      'pending',
      107,
      'Hendra Wijaya',
      'Realme 5',
      'HP mati total setelah kena air',
      [
        { productId: 8, quantity: 1, price: 80000, subtotal: 80000 }
      ],
      [
        { description: 'Servis HP water damage', price: 300000 },
        { description: 'Pengecekan komponen', price: 50000 }
      ],
      2
    )
  ];
  
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
