import { domainAvailabilityQuery } from '../api/availability/queries';
import { productsQuery } from '../api/products/queries';
import { domainSuggestionsQuery } from '../api/suggestions/queries';
import type { DomainSuggestion } from '../api/suggestions/data';
import type { QueryClient } from '@tanstack/react-query';
import type { ComponentType } from 'react';

export interface SelectedDomain {
	uuid: string;
	domain: string;
	tld: string;
	salePrice?: string;
	price: string;
}

export interface DomainSearchCart {
	items: SelectedDomain[];
	total: string;
	onAddItem: ( item: DomainSuggestion ) => Promise< unknown >;
	onRemoveItem: ( uuid: string ) => Promise< unknown >;
	hasItem: ( domainName: string ) => boolean;
}

export interface DomainSearchEvents {
	onContinue: () => void;
}

export interface DomainSearchProps {
	slots?: {
		BeforeResults?: ComponentType;
		BeforeFullCartItems?: ComponentType;
	};
	cart: DomainSearchCart;
	className?: string;
	initialQuery?: string;
	events?: Partial< DomainSearchEvents >;
	currentSiteUrl?: string;
	queryClient?: QueryClient;
}

export interface DomainSearchContextType
	extends Omit< DomainSearchProps, 'className' | 'initialQuery' | 'events' | 'queryClient' > {
	events: DomainSearchEvents;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
	query: string;
	setQuery: ( query: string ) => void;
	queries: {
		domainSuggestions: typeof domainSuggestionsQuery;
		domainAvailability: typeof domainAvailabilityQuery;
		products: typeof productsQuery;
	};
}
