import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import CreateTransaction from './pages/CreateTransaction';
import ProcessTransaction from './pages/ProcessTransaction';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ManageUsers from './pages/ManageUsers';
import StoreSettings from './pages/StoreSettings';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { StoreProfileProvider } from './contexts/StoreProfileContext';
import './index.css';

function App() {
  useEffect(() => {
    // Load Poppins font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return (
    <AuthProvider>
      <DataProvider>
        <StoreProfileProvider>
          <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="create-transaction" element={<CreateTransaction />} />
                <Route path="process-transaction/:id" element={<ProcessTransaction />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="store-settings" element={<StoreSettings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </StoreProfileProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
