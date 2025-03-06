import { useState } from 'react';
import { useStoreProfile } from '../contexts/StoreProfileContext';
import { ArrowLeft, Check, CircleAlert, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoreSettings = () => {
  const { storeProfile, updateStoreProfile } = useStoreProfile();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: storeProfile.name,
    address: storeProfile.address,
    phone: storeProfile.phone,
    city: storeProfile.city
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setError('Nama toko tidak boleh kosong');
      return;
    }

    if (!formData.address.trim()) {
      setError('Alamat toko tidak boleh kosong');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Nomor telepon toko tidak boleh kosong');
      return;
    }

    if (!formData.city.trim()) {
      setError('Kota tidak boleh kosong');
      return;
    }

    // Update store profile
    try {
      updateStoreProfile(formData);
      setSuccess('Profil toko berhasil diperbarui');
    } catch (err) {
      setError('Terjadi kesalahan. Silahkan coba lagi.');
    }
  };

  const resetToDefaults = () => {
    const defaultProfile = {
      name: 'HP Service POS',
      address: 'Jl. Contoh No. 123',
      phone: '021-1234567',
      city: 'Jakarta'
    };
    
    setFormData(defaultProfile);
    updateStoreProfile(defaultProfile);
    setSuccess('Profil toko telah direset ke pengaturan default');
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
        <h1 className="text-2xl font-bold">Pengaturan Profil Toko</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 flex flex-col items-center border-b border-gray-200">
            <div className="bg-primary-100 p-4 rounded-full mb-4">
              <Store size={48} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold">{storeProfile.name}</h2>
            <p className="text-gray-500">{storeProfile.address}, {storeProfile.city}</p>
            <p className="text-gray-500">{storeProfile.phone}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
                <CircleAlert size={16} className="mr-2" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm flex items-center">
                <Check size={16} className="mr-2" />
                {success}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Toko
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masukkan nama toko"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Toko
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masukkan alamat toko"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Kota
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masukkan kota"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={resetToDefaults}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Reset ke Default
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Preview Nota</h2>
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="receipt-wrapper mx-auto">
                <div className="receipt-container">
                  <div className="receipt-header">
                    <div className="receipt-logo">
                      <Store size={24} className="receipt-icon" />
                    </div>
                    <h1 className="receipt-title">{formData.name}</h1>
                    <p className="receipt-address">{formData.address}, {formData.city}</p>
                    <p className="receipt-contact">Telp: {formData.phone}</p>
                    <div className="receipt-divider"></div>
                    <h2 className="receipt-label">NOTA SERVIS</h2>
                    <div className="receipt-divider"></div>
                  </div>

                  <div className="receipt-transaction-info">
                    <div className="receipt-row">
                      <span className="receipt-label">No:</span>
                      <span className="receipt-value">#123456789</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Tanggal:</span>
                      <span className="receipt-value">01/01/2023 10:00</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Kasir:</span>
                      <span className="receipt-value">Admin</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Pelanggan:</span>
                      <span className="receipt-value">Pelanggan</span>
                    </div>
                  </div>

                  <div className="receipt-divider"></div>
                  <div className="receipt-row total">
                    <span className="receipt-label">Total:</span>
                    <span className="receipt-value">Rp150.000</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Tunai:</span>
                    <span className="receipt-value">Rp200.000</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Kembalian:</span>
                    <span className="receipt-value">Rp50.000</span>
                  </div>
                  <div className="receipt-divider"></div>

                  <div className="receipt-footer">
                    <p>Terima kasih atas kunjungan Anda</p>
                    <p>*Garansi servis 7 hari*</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Preview ini menunjukkan bagaimana informasi toko akan muncul pada nota yang dicetak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
