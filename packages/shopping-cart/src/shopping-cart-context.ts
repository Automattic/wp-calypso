/**
 * External dependencies
 */
import { createContext } from 'react';

/**
 * Internal dependencies
 */
import type { ShoppingCartManager } from './types';

const ShoppingCartContext = createContext< ShoppingCartManager | undefined >( undefined );
export default ShoppingCartContext;
