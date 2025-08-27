import { domainAvailabilityQuery } from '../queries/availability';
import { domainSuggestionsQuery } from '../queries/suggestions';
import type { DomainSuggestion } from '@automattic/data';
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
		domainSuggestions: ( query: string ) => ReturnType< typeof domainSuggestionsQuery >;
		domainAvailability: ( domainName: string ) => ReturnType< typeof domainAvailabilityQuery >;
	};
}
