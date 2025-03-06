import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
};

export type TransactionItem = {
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
};

export type ServiceItem = {
  description: string;
  price: number;
};

export type Transaction = {
  id: number;
  items: TransactionItem[];
  services: ServiceItem[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
  technicianId: number;
  cashierId?: number;
  customerName?: string;
  amountPaid?: number;
  change?: number;
  phoneType?: string; // Added phone type field
  damageDescription?: string; // Added damage description field
};

type DataContextType = {
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'status'>) => number;
  updateTransaction: (transaction: Transaction) => void;
  getProduct: (id: number) => Product | undefined;
  getCategory: (id: number) => Category | undefined;
  getTransaction: (id: number) => Transaction | undefined;
  updateStock: (productId: number, quantity: number) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load initial data from localStorage
  useEffect(() => {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }

    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }

    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: Date.now(),
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(
      categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
  };

  const deleteCategory = (id: number) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now(),
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const createTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'status'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
    };
    setTransactions([...transactions, newTransaction]);
    return newTransaction.id;
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  const getProduct = (id: number) => {
    return products.find((product) => product.id === id);
  };

  const getCategory = (id: number) => {
    return categories.find((category) => category.id === id);
  };

  const getTransaction = (id: number) => {
    return transactions.find((transaction) => transaction.id === id);
  };

  const updateStock = (productId: number, quantity: number) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, stock: product.stock - quantity }
          : product
      )
    );
  };

  const value = {
    categories,
    products,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    createTransaction,
    updateTransaction,
    getProduct,
    getCategory,
    getTransaction,
    updateStock,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
