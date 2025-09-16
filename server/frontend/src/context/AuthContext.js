import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  refreshProfile: async () => {},
  initializing: true,
});

export default AuthContext;
