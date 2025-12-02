import {
	availableTldsQuery,
	domainAvailabilityQuery,
	domainSuggestionsQuery,
	freeSuggestionQuery,
} from '@automattic/api-queries';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_FILTER } from './constants';
import { type DomainSearchProps, type DomainSearchContextType } from './types';

const noop = () => {};

export const DEFAULT_CONTEXT_VALUE: DomainSearchContextType = {
	events: {
		onContinue: noop,
		onSkip: noop,
		onExternalDomainClick: noop,
		onMakePrimaryAddressClick: noop,
		onMoveDomainToSiteClick: noop,
		onRegisterDomainClick: noop,
		onCheckTransferStatusClick: noop,
		onMapDomainClick: noop,
		onSubmitButtonClick: noop,
		onQueryChange: noop,
		onQueryClear: noop,
		onAddDomainToCart: noop,
		onQueryAvailabilityCheck: noop,
		onDomainAddAvailabilityPreCheck: noop,
		onFilterApplied: noop,
		onFilterReset: noop,
		onShowMoreResults: noop,
		onSuggestionsReceive: noop,
		onSuggestionRender: noop,
		onSuggestionInteract: noop,
		onSuggestionNotFound: noop,
		onTrademarkClaimsNoticeShown: noop,
		onTrademarkClaimsNoticeAccepted: noop,
		onTrademarkClaimsNoticeClosed: noop,
		onPageView: noop,
	},
	queries: {
		availableTlds: ( search?: string, vendor?: string ) => availableTldsQuery( vendor, search ),
		domainSuggestions: ( query: string, params?: Partial< typeof domainSuggestionsQuery > ) =>
			domainSuggestionsQuery( query, params ),
		domainAvailability: ( domainName: string ) => domainAvailabilityQuery( domainName ),
		freeSuggestion: ( query: string ) => freeSuggestionQuery( query ),
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
	config: {
		vendor: 'variation2_front',
		skippable: false,
		deemphasizedTlds: [],
		includeDotBlogSubdomain: false,
		allowsUsingOwnDomain: false,
		includeOwnedDomainInSuggestions: false,
		allowedTlds: [],
		numberOfDomainsResultsPerPage: 10,
		priceRules: {
			hidePrice: false,
			oneTimePrice: false,
			freeForFirstYear: false,
		},
	},
	filter: {
		exactSldMatchesOnly: false,
		tlds: [],
	},
	setFilter: () => {},
	resetFilter: () => {},
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

export const useDomainSearchContextValue = ( {
	currentSiteUrl: externalSiteUrl,
	currentSiteId,
	query: externalQuery,
	cart,
	events,
	slots,
	config,
}: DomainSearchProps ): typeof DEFAULT_CONTEXT_VALUE => {
	const currentSiteUrl = externalSiteUrl?.replace( /^https?:\/\//, '' );

	const [ isFullCartOpen, setIsFullCartOpen ] = useState( false );
	const [ filter, setFilter ] = useState( DEFAULT_FILTER );

	const closeFullCart = useCallback( () => {
		setIsFullCartOpen( false );
	}, [] );

	const openFullCart = useCallback( () => {
		setIsFullCartOpen( true );
	}, [] );

	const normalizedEvents = useMemo( () => {
		return {
			...DEFAULT_CONTEXT_VALUE.events,
			...events,
		};
	}, [ events ] );

	const normalizedConfig = useMemo( () => {
		return {
			...DEFAULT_CONTEXT_VALUE.config,
			...config,
		};
	}, [ config ] );

	return useMemo( () => {
		const allowedTlds = normalizedConfig.allowedTlds?.length
			? normalizedConfig.allowedTlds
			: undefined;

		return {
			...DEFAULT_CONTEXT_VALUE,
			events: normalizedEvents,
			config: normalizedConfig,
			queries: {
				domainSuggestions: ( query ) => ( {
					...domainSuggestionsQuery( query, {
						quantity: 30,
						vendor: normalizedConfig.vendor,
						tlds: filter.tlds.length > 0 ? filter.tlds : allowedTlds,
						exact_sld_matches_only: filter.exactSldMatchesOnly,
						include_internal_move_eligible: normalizedConfig.includeOwnedDomainInSuggestions,
						site_slug: currentSiteUrl,
					} ),
					enabled: false,
					staleTime: Infinity,
					refetchOnMount: false,
					refetchOnWindowFocus: false,
				} ),
				freeSuggestion: ( query ) => ( {
					...freeSuggestionQuery( query, {
						include_dotblogsubdomain: normalizedConfig.includeDotBlogSubdomain,
					} ),
					enabled: false,
					staleTime: Infinity,
					refetchOnMount: false,
					refetchOnWindowFocus: false,
				} ),
				domainAvailability: ( domainName, isCartPreCheck = false ) => ( {
					...domainAvailabilityQuery( domainName, {
						vendor: normalizedConfig.vendor,
						blog_id: currentSiteId,
						is_cart_pre_check: isCartPreCheck,
					} ),
					enabled: false,
					staleTime: Infinity,
					refetchOnMount: false,
					refetchOnWindowFocus: false,
				} ),
				availableTlds: ( vendor, search ) => ( {
					...availableTldsQuery( vendor, search ),
					select: ( data ) => {
						if ( allowedTlds ) {
							return data.filter( ( tld ) => allowedTlds.includes( tld ) );
						}

						return data;
					},
					enabled: false,
					staleTime: Infinity,
					refetchOnMount: false,
					refetchOnWindowFocus: false,
				} ),
			},
			cart,
			isFullCartOpen,
			closeFullCart,
			openFullCart,
			query: externalQuery ?? '',
			setQuery: ( query ) => {
				const normalizedQuery = query
					.trim()
					.toLowerCase()
					.replace( /^(https?:\/\/)?(www[0-9]?\.)?/, '' )
					.replace( /[^a-zA-ZÀ-ÖÙ-öù-ÿĀ-žḀ-ỿ0-9-. ]/g, '' );

				if ( normalizedQuery ) {
					normalizedEvents.onQueryChange( normalizedQuery );
				}
			},
			slots,
			currentSiteUrl,
			filter,
			setFilter: ( filter ) => {
				setFilter( filter );
				normalizedEvents.onFilterApplied( filter );
			},
			resetFilter: () => {
				setFilter( DEFAULT_FILTER );
				normalizedEvents.onFilterReset( DEFAULT_FILTER, [ 'tlds', 'exactSldMatchesOnly' ] );
			},
		};
	}, [
		isFullCartOpen,
		closeFullCart,
		openFullCart,
		externalQuery,
		cart,
		normalizedEvents,
		slots,
		currentSiteUrl,
		currentSiteId,
		normalizedConfig,
		filter,
		setFilter,
	] );
};
