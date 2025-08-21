import { createContext, useContext } from 'react';
import { domainAvailabilityQuery } from '../queries/availability';
import { productsQuery } from '../queries/products';
import { domainSuggestionsQuery } from '../queries/suggestions';
import { type DomainSearchContextType } from './types';

const noop = () => {};

export const DEFAULT_CONTEXT_VALUE: DomainSearchContextType = {
	events: {
		onContinue: noop,
	},
	queries: {
		domainSuggestions: domainSuggestionsQuery,
		domainAvailability: domainAvailabilityQuery,
		products: productsQuery,
	},
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

export const DomainSearchContext =
	createContext< DomainSearchContextType >( DEFAULT_CONTEXT_VALUE );

export const useDomainSearch = () => {
	const context = useContext( DomainSearchContext );

	if ( context === DEFAULT_CONTEXT_VALUE ) {
		throw new Error( 'useDomainSearch must be used within a DomainSearchContext' );
	}

	return context;
};
