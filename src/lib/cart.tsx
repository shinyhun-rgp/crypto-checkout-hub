import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  slug: string;
  name: string;
  amount: number;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  method: "email" | "sms";
  status: "Processing" | "Delivered";
  items: CartItem[];
  total: number;
};

const CART_KEY = "giftshop.cart.v1";
const ORDERS_KEY = "giftshop.orders.v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function loadOrders(): Order[] {
  return readJSON<Order[]>(ORDERS_KEY, []);
}

export function findOrder(query: string): Order | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return loadOrders().find((o) => o.id.toLowerCase() === q || o.email.toLowerCase() === q);
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  hydrated: boolean;
  add: (item: CartItem) => void;
  setQuantity: (slug: string, amount: number, quantity: number) => void;
  remove: (slug: string, amount: number) => void;
  clear: () => void;
  placeOrder: (details: { name: string; email: string; method: "email" | "sms" }) => Order;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readJSON<CartItem[]>(CART_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeJSON(CART_KEY, items);
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.slug === item.slug && i.amount === item.amount);
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
      return next;
    });
  }, []);

  const setQuantity = useCallback((slug: string, amount: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => !(i.slug === slug && i.amount === amount))
        : prev.map((i) => (i.slug === slug && i.amount === amount ? { ...i, quantity } : i)),
    );
  }, []);

  const remove = useCallback((slug: string, amount: number) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.amount === amount)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.amount * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const placeOrder = useCallback<CartContextValue["placeOrder"]>(
    (details) => {
      const order: Order = {
        id: `GS-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: "Processing",
        items,
        total,
        ...details,
      };
      writeJSON(ORDERS_KEY, [order, ...loadOrders()]);
      setItems([]);
      return order;
    },
    [items, total],
  );

  const value = useMemo(
    () => ({ items, count, total, hydrated, add, setQuantity, remove, clear, placeOrder }),
    [items, count, total, hydrated, add, setQuantity, remove, clear, placeOrder],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
