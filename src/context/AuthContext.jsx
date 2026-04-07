import { createContext, useContext, useEffect, useState } from "react";
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  logout as firebaseLogout,
  onAuthChange,
} from "@/firebase/auth";
import { saveUserProfile } from "@/firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => loginWithEmail(email, password);

  const register = async (email, password, displayName) => {
    const result = await registerWithEmail(email, password);
    await saveUserProfile(result.user.uid, {
      email,
      displayName,
      createdAt: new Date().toISOString(),
      photoURL: null,
    });
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithGoogle();
    await saveUserProfile(result.user.uid, {
      email: result.user.email,
      displayName: result.user.displayName,
      createdAt: new Date().toISOString(),
      photoURL: result.user.photoURL,
    });
    return result;
  };

  const logout = () => firebaseLogout();

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}