import { createContext } from 'react';
import type { ShoppingCartManagerOptions } from './types';

const ShoppingCartOptionsContext = createContext< ShoppingCartManagerOptions >( {} );
export default ShoppingCartOptionsContext;
