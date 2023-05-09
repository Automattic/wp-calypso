import { createContext } from 'react';
import type { ShoppingCartManagerClient } from './types';

const ShoppingCartContext = createContext< ShoppingCartManagerClient | undefined >( undefined );
export default ShoppingCartContext;
