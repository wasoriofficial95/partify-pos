import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name,
        username: user.username
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!formData.name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }

    if (showPasswordFields) {
      if (!formData.currentPassword) {
        setError('Password saat ini diperlukan');
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('Password baru minimal 6 karakter');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Konfirmasi password tidak sesuai');
        return;
      }
    }

    // Update profile
    try {
      const updateData = {
        name: formData.name,
        username: formData.username,
        ...(showPasswordFields ? {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        } : {})
      };

      const success = updateUserProfile(updateData);
      if (success) {
        setSuccess('Profil berhasil diperbarui');
        setShowPasswordFields(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        setError('Password saat ini tidak sesuai');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silahkan coba lagi.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Profil Pengguna</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 flex flex-col items-center border-b border-gray-200">
            <div className="bg-primary-100 p-4 rounded-full mb-4">
              <User size={48} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold">{user?.name}</h2>
            <p className="text-gray-500 capitalize">{user?.role === 'admin' ? 'Admin' : user?.role === 'technician' ? 'Teknisi' : 'Kasir'}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masukkan username"
              />
            </div>

            {!showPasswordFields ? (
              <button
                type="button"
                onClick={() => setShowPasswordFields(true)}
                className="text-primary-600 text-sm hover:underline mb-4"
              >
                Ubah Password
              </button>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Password Saat Ini
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Masukkan password saat ini"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Masukkan password baru"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Konfirmasi password baru"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswordFields(false)}
                  className="text-red-600 text-sm hover:underline mb-4"
                >
                  Batal Ubah Password
                </button>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Akun</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">ID Pengguna</p>
                <p className="font-medium">{user?.id}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Peran</p>
                <p className="font-medium capitalize">{user?.role === 'admin' ? 'Admin' : user?.role === 'technician' ? 'Teknisi' : 'Kasir'}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktif
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
