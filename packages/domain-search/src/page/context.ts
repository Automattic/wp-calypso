import { createContext, useContext } from 'react';
import { domainAvailabilityQuery } from '../api/availability/queries';
import { productsQuery } from '../api/products/queries';
import { domainSuggestionsQuery } from '../api/suggestions/queries';
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
