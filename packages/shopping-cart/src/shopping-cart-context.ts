import { createContext } from 'react';
import type { ShoppingCartManager } from './types';

const ShoppingCartContext = createContext< ShoppingCartManager | undefined >( undefined );
export default ShoppingCartContext;
