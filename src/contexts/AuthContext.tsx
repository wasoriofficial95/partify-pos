import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type User = {
  id: number;
  username: string;
  role: 'admin' | 'technician' | 'cashier';
  name: string;
};

type ProfileUpdateData = {
  name: string;
  username: string;
  currentPassword?: string;
  newPassword?: string;
};

type UserUpdateData = {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'technician' | 'cashier';
  password?: string;
};

type UserCreateData = {
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'technician' | 'cashier';
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (data: ProfileUpdateData) => boolean;
  getAllUsers: () => User[];
  addUser: (data: UserCreateData) => boolean;
  updateUser: (data: UserUpdateData) => boolean;
  deleteUser: (id: number) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u: any) => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUserProfile = (data: ProfileUpdateData): boolean => {
    if (!user) return false;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex === -1) return false;

    // Check if trying to change password
    if (data.currentPassword && data.newPassword) {
      // Verify current password
      if (users[userIndex].password !== data.currentPassword) {
        return false;
      }
      
      // Update password
      users[userIndex].password = data.newPassword;
    }

    // Check if username is already taken by someone else
    if (data.username !== user.username) {
      const existingUser = users.find(
        (u: any) => u.username === data.username && u.id !== user.id
      );
      
      if (existingUser) {
        return false;
      }
    }

    // Update user data
    users[userIndex].name = data.name;
    users[userIndex].username = data.username;
    
    // Save changes to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user in session
    const updatedUser = {
      id: user.id,
      name: data.name,
      username: data.username,
      role: user.role
    };
    
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return true;
  };

  const getAllUsers = (): User[] => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.map((u: any) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
  };

  const addUser = (data: UserCreateData): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    const existingUser = users.find((u: any) => u.username === data.username);
    if (existingUser) return false;
    
    // Generate a new ID
    const maxId = users.reduce((max: number, u: any) => (u.id > max ? u.id : max), 0);
    const newUser = {
      id: maxId + 1,
      ...data
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return true;
  };

  const updateUser = (data: UserUpdateData): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === data.id);
    
    if (userIndex === -1) return false;

    // Check if username is already taken by someone else
    if (data.username !== users[userIndex].username) {
      const existingUser = users.find(
        (u: any) => u.username === data.username && u.id !== data.id
      );
      
      if (existingUser) {
        return false;
      }
    }

    // Update user data
    users[userIndex].name = data.name;
    users[userIndex].username = data.username;
    users[userIndex].role = data.role;
    
    // Update password if provided
    if (data.password) {
      users[userIndex].password = data.password;
    }
    
    // Save changes to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user in session if this is the logged in user
    if (user && user.id === data.id) {
      const updatedUser = {
        id: data.id,
        name: data.name,
        username: data.username,
        role: data.role
      };
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return true;
  };

  const deleteUser = (id: number): boolean => {
    // Can't delete yourself or the main admin (id: 1)
    if (user?.id === id || id === 1) return false;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter((u: any) => u.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    return true;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    updateUserProfile,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
