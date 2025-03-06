import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChartBar, CircleDollarSign, CreditCard, House, LogOut, Settings, ShoppingCart, Smartphone, Store, Tag, User, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const menuItems = [
      { to: '/', label: 'Dashboard', icon: <House size={20} />, roles: ['admin', 'technician', 'cashier'] },
      { to: '/profile', label: 'Profil', icon: <User size={20} />, roles: ['admin', 'technician', 'cashier'] },
      { to: '/store-settings', label: 'Profil Toko', icon: <Store size={20} />, roles: ['admin', 'cashier'] },
    ];

    if (user?.role === 'admin') {
      menuItems.push(
        { to: '/products', label: 'Produk', icon: <Smartphone size={20} />, roles: ['admin'] },
        { to: '/categories', label: 'Kategori', icon: <Tag size={20} />, roles: ['admin'] },
        { to: '/reports', label: 'Laporan', icon: <ChartBar size={20} />, roles: ['admin'] },
        { to: '/manage-users', label: 'Kelola Pengguna', icon: <Users size={20} />, roles: ['admin'] }
      );
    }

    if (user?.role === 'technician') {
      menuItems.push(
        { to: '/create-transaction', label: 'Buat Transaksi', icon: <ShoppingCart size={20} />, roles: ['technician'] }
      );
    }

    if (user?.role === 'cashier') {
      menuItems.push(
        { to: '/reports', label: 'Hasil Penjualan', icon: <ChartBar size={20} />, roles: ['cashier'] }
      );
    }

    return menuItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-primary-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-primary-800">
        <h1 className="text-xl font-bold text-white flex items-center">
          <CircleDollarSign className="mr-2" size={24} />
          HP Service POS
        </h1>
      </div>
      
      <div className="p-4 border-b border-primary-800">
        <div className="text-sm text-primary-200">Login sebagai</div>
        <div className="font-medium">{user?.name || ''}</div>
        <div className="text-xs mt-1 bg-primary-700 text-white px-2 py-1 rounded-full inline-block capitalize">
          {user?.role === 'admin' 
            ? 'Admin' 
            : user?.role === 'technician' 
              ? 'Teknisi' 
              : 'Kasir'}
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center px-4 py-3 rounded-lg text-sm ${
                  location.pathname === item.to
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-primary-800 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-sm text-primary-200 hover:bg-primary-800 rounded-lg w-full"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
