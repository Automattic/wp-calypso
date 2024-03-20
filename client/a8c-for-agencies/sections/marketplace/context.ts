import { createContext } from 'react';
import type { ShoppingCartContext as ShoppingCartContextInterface } from './types';

export const ShoppingCartContext = createContext< ShoppingCartContextInterface >( {
	selectedCartItems: [],
	setSelectedCartItems: () => {
		return undefined;
	},
} );
