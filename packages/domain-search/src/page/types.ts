import { domainAvailabilityQuery } from '../queries/availability';
import type { DomainSuggestion, domainSuggestionsQuery } from '../queries/suggestions';
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
	onRemoveItem: ( item: SelectedDomain[ 'uuid' ] ) => Promise< unknown >;
	hasItem: ( domain: SelectedDomain[ 'domain' ] ) => boolean;
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
}

export interface DomainSearchContextType
	extends Omit< DomainSearchProps, 'className' | 'initialQuery' | 'events' > {
	events: DomainSearchEvents;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
	query: string;
	setQuery: ( query: string ) => void;
	queries: {
		domainSuggestions: typeof domainSuggestionsQuery;
		domainAvailability: typeof domainAvailabilityQuery;
	};
}
