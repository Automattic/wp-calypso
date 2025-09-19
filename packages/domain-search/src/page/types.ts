import {
	availableTldsQuery,
	domainSuggestionsQuery,
	freeSuggestionQuery,
	domainAvailabilityQuery,
} from '@automattic/api-queries';
import { PriceRulesConfig } from '../hooks/use-suggestion';
import type { FilterState } from '../components/search-bar/types';
import type {
	DomainSuggestion,
	DomainSuggestionQueryVendor,
	FreeDomainSuggestion,
} from '@automattic/api-core';
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
	onSkip: ( suggestion?: FreeDomainSuggestion ) => void;
	onExternalDomainClick?: ( domainName?: string ) => void;
	onMakePrimaryAddressClick: ( domainName: string ) => void;
	onMoveDomainToSiteClick: ( otherSiteDomain: string, domainName: string ) => void;
	onTransferDomainToWordPressComClick: ( domainName: string ) => void;
	onRegisterDomainClick: ( otherSiteDomain: string, domainName: string ) => void;
	onCheckTransferStatusClick: ( domainName: string ) => void;
	onMapDomainClick: ( currentSiteSlug: string, domainName: string ) => void;
	onQueryChange: ( query: string ) => void;
}

export interface DomainSearchConfig {
	vendor: DomainSuggestionQueryVendor;
	skippable: boolean;
	deemphasizedTlds: string[];
	priceRules: PriceRulesConfig;
	includeDotBlogSubdomain: boolean;
	allowsUsingOwnDomain: boolean;
	allowedTlds: string[];
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
	config?: Partial< DomainSearchConfig >;
}

export interface DomainSearchContextType
	extends Omit<
		DomainSearchProps,
		'className' | 'initialQuery' | 'events' | 'config' | 'getPriceRuleForSuggestion'
	> {
	events: DomainSearchEvents;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
	query: string;
	setQuery: ( query: string ) => void;
	filter: FilterState;
	setFilter: ( filter: FilterState ) => void;
	queries: {
		availableTlds: ( query?: string, vendor?: string ) => ReturnType< typeof availableTldsQuery >;
		domainSuggestions: (
			query: string,
			params?: Partial< typeof domainSuggestionsQuery >
		) => ReturnType< typeof domainSuggestionsQuery >;
		domainAvailability: ( domainName: string ) => ReturnType< typeof domainAvailabilityQuery >;
		freeSuggestion: ( query: string ) => ReturnType< typeof freeSuggestionQuery >;
	};
	config: DomainSearchConfig;
}

export type { PriceRulesConfig };
