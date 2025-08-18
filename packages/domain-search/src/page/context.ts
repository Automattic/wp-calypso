import { createContext, useContext } from 'react';
import type { DomainSearchCart } from './types';

interface DomainSearchContextType {
	onContinue: () => void;
	cart: DomainSearchCart;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
	query: string;
	setQuery: ( query: string ) => void;
}

const DEFAULT_VALUE: DomainSearchContextType = {
	onContinue: () => {},
	cart: {
		items: [],
		total: '',
		hasItem: () => false,
		onAddItem: () => Promise.resolve(),
		onRemoveItem: () => Promise.resolve(),
	},
	isFullCartOpen: false,
	closeFullCart: () => {},
	openFullCart: () => {},
	query: '',
	setQuery: () => {},
};

export const DomainSearchContext = createContext< DomainSearchContextType >( DEFAULT_VALUE );

export const useDomainSearch = () => {
	const context = useContext( DomainSearchContext );

	if ( context === DEFAULT_VALUE ) {
		throw new Error( 'useDomainSearch must be used within a DomainSearchContext' );
	}

	return context;
};
