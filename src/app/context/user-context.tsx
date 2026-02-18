import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>(() => {
    // Get from localStorage or create new
    const stored = localStorage.getItem('brainmate-user-id');
    if (stored) return stored;
    
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('brainmate-user-id', newId);
    return newId;
  });

  useEffect(() => {
    localStorage.setItem('brainmate-user-id', userId);
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
