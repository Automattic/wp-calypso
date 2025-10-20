import {
	availableTldsQuery,
	domainSuggestionsQuery,
	freeSuggestionQuery,
	domainAvailabilityQuery,
} from '@automattic/api-queries';
import { PriceRulesConfig, useSuggestion } from '../hooks/use-suggestion';
import type { FilterState } from '../components/search-bar/types';
import type { FeaturedSuggestionReason } from '../helpers/partition-suggestions';
import type {
	DomainAvailability,
	DomainAvailabilityStatus,
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
	onExternalDomainClick: ( domainName?: string ) => void;
	onMakePrimaryAddressClick: ( domainName: string ) => void;
	onMoveDomainToSiteClick: ( otherSiteDomain: string, domainName: string ) => void;
	onRegisterDomainClick: ( otherSiteDomain: string, domainName: string ) => void;
	onCheckTransferStatusClick: ( domainName: string ) => void;
	onMapDomainClick: ( domainName: string ) => void;
	onQueryChange: ( query: string ) => void;
	onQueryClear: () => void;
	onAddDomainToCart: (
		domainName: string,
		position: number,
		isPremium: boolean,
		rootVendor: string
	) => void;
	onQueryAvailabilityCheck: (
		status: DomainAvailabilityStatus,
		domainName: string,
		responseTime: number
	) => void;
	onDomainAddAvailabilityPreCheck: (
		availabilityStatus: DomainAvailability,
		domainName: string,
		rootVendor: string
	) => void;
	onFilterApplied: ( filter: FilterState ) => void;
	onFilterReset: ( filter: FilterState, keysToReset: string[] ) => void;
	onSuggestionsReceive: ( query: string, suggestions: string[], responseTime: number ) => void;
	onSuggestionRender: (
		suggestion: ReturnType< typeof useSuggestion >,
		reason?: FeaturedSuggestionReason
	) => void;
	onSuggestionInteract: ( suggestion: ReturnType< typeof useSuggestion > ) => void;
	onSuggestionNotFound: ( domainName: string ) => void;
	onTrademarkClaimsNoticeShown: ( suggestion: ReturnType< typeof useSuggestion > ) => void;
	onTrademarkClaimsNoticeAccepted: ( suggestion: ReturnType< typeof useSuggestion > ) => void;
	onTrademarkClaimsNoticeClosed: ( suggestion: ReturnType< typeof useSuggestion > ) => void;
	onPageView: () => void;
}

export interface DomainSearchConfig {
	vendor: DomainSuggestionQueryVendor;
	skippable: boolean;
	deemphasizedTlds: string[];
	priceRules: PriceRulesConfig;
	includeDotBlogSubdomain: boolean;
	allowsUsingOwnDomain: boolean;
	allowedTlds: string[];
	includeOwnedDomainInSuggestions: boolean;
}

export interface DomainSearchProps {
	slots?: {
		BeforeResults?: ComponentType;
		BeforeFullCartItems?: ComponentType;
	};
	cart: DomainSearchCart;
	className?: string;
	query?: string;
	events?: Partial< DomainSearchEvents >;
	currentSiteUrl?: string;
	currentSiteId?: number;
	config?: Partial< DomainSearchConfig >;
}

export interface DomainSearchContextType
	extends Omit<
		DomainSearchProps,
		'className' | 'events' | 'config' | 'getPriceRuleForSuggestion'
	> {
	events: DomainSearchEvents;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
	query: string;
	setQuery: ( query: string ) => void;
	filter: FilterState;
	setFilter: ( filter: FilterState ) => void;
	resetFilter: () => void;
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
