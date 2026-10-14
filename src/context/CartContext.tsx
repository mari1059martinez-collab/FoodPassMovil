// src/context/CartContext.tsx
//
// Estado global del carrito de compras para FoodPass Móvil (T07 - RFM04, RFM05).
// Mantiene los productos seleccionados a lo largo de la navegación y provee
// las operaciones requeridas: addItem, removeItem, clearCart y getTotalPrice.

import React, { createContext, useContext, useState, useMemo } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  image?: string;
  category?: string;
  badge?: string | null;
  badgeType?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string, forceRemove?: boolean) => void;
  deleteItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
  totalItems: number;
  totalPrice: number;
  formattedTotalPrice: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const cleaned = price.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: CartProduct, quantity: number = 1) => {
    if (!product || !product.id) return;
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeItem = (id: string, forceRemove: boolean = false) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === id);
      if (!existing) return prevItems;
      if (forceRemove || existing.quantity <= 1) {
        return prevItems.filter((item) => item.id !== id);
      }
      return prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const deleteItem = (id: string) => {
    removeItem(id, true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      deleteItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = (): number => {
    const sum = items.reduce((total, item) => {
      return total + parsePrice(item.price) * item.quantity;
    }, 0);
    return Math.round(sum * 100) / 100;
  };

  const getTotalCount = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const totalItems = useMemo(() => getTotalCount(), [items]);
  const totalPrice = useMemo(() => getTotalPrice(), [items]);
  const formattedTotalPrice = useMemo(() => `$${totalPrice.toFixed(2)}`, [totalPrice]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        deleteItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalCount,
        totalItems,
        totalPrice,
        formattedTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
