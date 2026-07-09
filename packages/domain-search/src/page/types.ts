import {
	availableTldsQuery,
	bundleForDomainQuery,
	bundleSuggestionQuery,
	bundleTriggersQuery,
	domainSuggestionsQuery,
	freeSuggestionQuery,
	domainAvailabilityQuery,
} from '@automattic/api-queries';
import { PriceRulesConfig, useSuggestion } from '../hooks/use-suggestion';
import type { FilterState } from '../components/search-bar/types';
import type { FeaturedSuggestionReason } from '../helpers/partition-suggestions';
import type {
	BundleSuggestion,
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
	/**
	 * Bundle membership, present only when the item was added to the cart as
	 * part of a domain bundle. `groupId` is the server-issued bundle group id,
	 * passed through verbatim by the app layer; items sharing a `groupId` are
	 * rendered as a single grouped cart row. `price` is the formatted sum of
	 * the bundle members' current prices, computed and formatted at the app
	 * layer (the same value for every member of the group). `isPrimary` marks
	 * the bundle's anchor domain so the grouped row can list it first,
	 * matching the masterbar mini-cart and checkout member ordering.
	 */
	bundle?: {
		groupId: string;
		price: string;
		isPrimary?: boolean;
	};
}

export interface DomainSearchCart {
	items: SelectedDomain[];
	total: string;
	onAddItem: ( item: DomainSuggestion ) => Promise< unknown >;
	/**
	 * Add every member of a bundle suggestion to the cart in a single,
	 * all-or-nothing operation. Implemented at the app layer; when absent the
	 * bundle CTA is a no-op.
	 */
	onAddBundle?: ( bundle: BundleSuggestion ) => Promise< unknown >;
	onRemoveItem: ( uuid: string ) => Promise< unknown >;
	/**
	 * Remove every member of a bundle group from the cart in a single,
	 * all-or-nothing operation. Implemented at the app layer; when absent the
	 * grouped cart row falls back to removing each member individually. That
	 * fallback is not all-or-nothing — a failed member removal can leave the
	 * rest of the group orphaned in the cart — so consumers should provide
	 * this callback whenever their cart backend can batch the removal.
	 */
	onRemoveBundle?: ( bundleGroupId: string ) => Promise< unknown >;
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
	onSubmitButtonClick: ( query: string ) => void;
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
	onShowMoreResults: ( pageNumber: number ) => void;
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
	onBundleShown: ( bundle: BundleSuggestion ) => void;
	onBundleAddToCart: ( bundle: BundleSuggestion ) => void;
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
	numberOfDomainsResultsPerPage: number;
	/**
	 * Show domain bundle suggestions in the search flow. Frontend dev/Storybook
	 * gate, set from the `domain-bundling` feature flag at the app layer. Default
	 * false, so bundles stay hidden unless a consumer opts in.
	 */
	showBundleSuggestions: boolean;
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
		bundleSuggestion: ( query: string ) => ReturnType< typeof bundleSuggestionQuery >;
		bundleTriggers: ( query: string ) => ReturnType< typeof bundleTriggersQuery >;
		bundleForDomain: ( fqdn: string ) => ReturnType< typeof bundleForDomainQuery >;
	};
	config: DomainSearchConfig;
}

export type { PriceRulesConfig };
