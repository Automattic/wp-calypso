import { createContext } from 'react';
import type {
	ShoppingCartContext as ShoppingCartContextInterface,
	MarketplaceTypeContext as MarketplaceTypeContextInterface,
	TermPricingContext as TermPricingContextInterface,
} from './types';

export const ShoppingCartContext = createContext< ShoppingCartContextInterface >( {
	selectedCartItems: [],
	setSelectedCartItems: () => {
		return undefined;
	},
} );

export const MarketplaceTypeContext = createContext< MarketplaceTypeContextInterface >( {
	marketplaceType: 'regular',
	setMarketplaceType: () => {
		return undefined;
	},
	toggleMarketplaceType: () => {
		return undefined;
	},
} );

export const TermPricingContext = createContext< TermPricingContextInterface >( {
	termPricing: 'monthly',
	setTermPricing: () => {
		return undefined;
	},
	toggleTermPricing: () => {
		return undefined;
	},
} );
