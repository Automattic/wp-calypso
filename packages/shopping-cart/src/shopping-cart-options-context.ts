import { createContext } from 'react';
import type { ShoppingCartManagerOptions } from './types';

const ShoppingCartOptionsContext = createContext< ShoppingCartManagerOptions | undefined >(
	undefined
);
export default ShoppingCartOptionsContext;
