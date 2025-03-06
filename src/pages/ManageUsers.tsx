import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Pencil, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: number;
  username: string;
  role: 'admin' | 'technician' | 'cashier';
  name: string;
};

type UserFormData = {
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'technician' | 'cashier';
};

const ManageUsers = () => {
  const { user, getAllUsers, addUser, updateUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: '',
    password: '',
    role: 'admin'
  });
  const [error, setError] = useState('');

  // Only admin can access this page
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    } else {
      loadUsers();
    }
  }, [user, navigate]);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'admin'
    });
    setEditingUser(null);
    setError('');
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        password: '', // Don't set password when editing
        role: user.role
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!formData.name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Password tidak boleh kosong');
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const success = updateUser({
          id: editingUser.id,
          name: formData.name,
          username: formData.username,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {})
        });

        if (success) {
          loadUsers();
          closeModal();
        } else {
          setError('Gagal memperbarui pengguna. Username mungkin sudah digunakan.');
        }
      } else {
        // Add new user
        const success = addUser(formData);
        
        if (success) {
          loadUsers();
          closeModal();
        } else {
          setError('Gagal menambahkan pengguna. Username mungkin sudah digunakan.');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silahkan coba lagi.');
    }
  };

  const handleDelete = (userId: number) => {
    if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
      const success = deleteUser(userId);
      if (success) {
        loadUsers();
      } else {
        alert('Tidak dapat menghapus pengguna');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'technician': return 'Teknisi';
      case 'cashier': return 'Kasir';
      default: return role;
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
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => openModal()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
          >
            <Plus size={20} className="mr-1" /> Tambah Pengguna
          </button>
          
          <button
            onClick={() => {
              setFormData({
                name: '',
                username: '',
                password: '',
                role: 'admin'
              });
              openModal();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <UserPlus size={20} className="mr-1" /> Admin Baru
          </button>
          
          <button
            onClick={() => {
              setFormData({
                name: '',
                username: '',
                password: '',
                role: 'technician'
              });
              openModal();
            }}
            className="bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 flex items-center"
          >
            <UserPlus size={20} className="mr-1" /> Teknisi Baru
          </button>
          
          <button
            onClick={() => {
              setFormData({
                name: '',
                username: '',
                password: '',
                role: 'cashier'
              });
              openModal();
            }}
            className="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 flex items-center"
          >
            <UserPlus size={20} className="mr-1" /> Kasir Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peran
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.username}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'technician'
                            ? 'bg-accent-100 text-accent-800'
                            : 'bg-secondary-100 text-secondary-800'
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => openModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user.id === 1} // Prevent deleting the main admin
                      >
                        <Trash2 size={18} className={user.id === 1 ? "opacity-50" : ""} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    {searchTerm ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Belum ada pengguna'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUser && <span className="text-gray-400 text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={editingUser ? '••••••••' : ''}
                    required={!editingUser}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peran
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="technician">Teknisi</option>
                    <option value="cashier">Kasir</option>
                  </select>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
