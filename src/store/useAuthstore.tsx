import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      isLogin: false,
      token: null,

      login: (token:any) =>
        set({
          isLogin: true,
          token,
        }),

      logout: () =>
        set({
          isLogin: false,
          token: null,
        }),

      setToken: (token:any) =>
        set({
          token,
          isLogin: !!token,
        }),
    }),
    {
      name: "auth-storage", // key in localStorage
    }
  )
);

export default useAuthStore;