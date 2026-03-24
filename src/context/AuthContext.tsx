import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        const isAdminEmail = user.email === 'naren.papanaboina@gmail.com';
        const targetRole = isAdminEmail ? 'admin' : 'customer';

        if (docSnap.exists()) {
          let currentProfile = docSnap.data() as UserProfile;
          // Upgrade to admin if email matches but role is not admin
          if (isAdminEmail && currentProfile.role !== 'admin') {
            currentProfile = { ...currentProfile, role: 'admin' };
            await setDoc(docRef, currentProfile, { merge: true });
          }
          setProfile(currentProfile);
        } else {
          // New user
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: targetRole, // Assign admin if email matches
            createdAt: new Date().toISOString(),
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateRole = async (role: UserRole) => {
    if (user && profile) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { ...profile, role }, { merge: true });
      setProfile({ ...profile, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
