import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type StoreProfile = {
  name: string;
  address: string;
  phone: string;
  city: string;
};

type StoreProfileContextType = {
  storeProfile: StoreProfile;
  updateStoreProfile: (profile: StoreProfile) => void;
};

const defaultStoreProfile: StoreProfile = {
  name: 'HP Service POS',
  address: 'Jl. Contoh No. 123',
  phone: '021-1234567',
  city: 'Jakarta'
};

const StoreProfileContext = createContext<StoreProfileContextType | undefined>(undefined);

export const StoreProfileProvider = ({ children }: { children: ReactNode }) => {
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const savedProfile = localStorage.getItem('storeProfile');
    return savedProfile ? JSON.parse(savedProfile) : defaultStoreProfile;
  });

  useEffect(() => {
    localStorage.setItem('storeProfile', JSON.stringify(storeProfile));
  }, [storeProfile]);

  const updateStoreProfile = (profile: StoreProfile) => {
    setStoreProfile(profile);
  };

  return (
    <StoreProfileContext.Provider value={{ storeProfile, updateStoreProfile }}>
      {children}
    </StoreProfileContext.Provider>
  );
};

export const useStoreProfile = () => {
  const context = useContext(StoreProfileContext);
  if (context === undefined) {
    throw new Error('useStoreProfile must be used within a StoreProfileProvider');
  }
  return context;
};
