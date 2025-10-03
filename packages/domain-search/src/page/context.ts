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
		onMakePrimaryAddressClick: noop,
		onMoveDomainToSiteClick: noop,
		onTransferDomainToWordPressComClick: noop,
		onRegisterDomainClick: noop,
		onCheckTransferStatusClick: noop,
		onMapDomainClick: noop,
		onQueryChange: noop,
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
		allowsUsingOwnDomain: true,
		includeOwnedDomainInSuggestions: true,
		allowedTlds: [],
		priceRules: {
			hidePrice: false,
			oneTimePrice: false,
			forceRegularPrice: false,
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

export const useDomainSearchContextValue = (
	props: DomainSearchProps
): typeof DEFAULT_CONTEXT_VALUE => {
	const { currentSiteUrl, query: externalQuery, cart, events, slots, config } = props;

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
					} ),
					enabled: false,
				} ),
				freeSuggestion: ( query ) => ( {
					...freeSuggestionQuery( query, {
						include_dotblogsubdomain: normalizedConfig.includeDotBlogSubdomain
							? query.includes( '.blog' )
							: false,
					} ),
					enabled: normalizedConfig.skippable,
				} ),
				domainAvailability: ( domainName ) => ( {
					...domainAvailabilityQuery( domainName ),
					enabled: false,
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
				} ),
			},
			cart,
			isFullCartOpen,
			closeFullCart,
			openFullCart,
			query: externalQuery ?? '',
			setQuery: ( query ) => {
				normalizedEvents.onQueryChange( query );
			},
			slots,
			currentSiteUrl,
			filter,
			setFilter,
			resetFilter: () => setFilter( DEFAULT_FILTER ),
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
		normalizedConfig,
		filter,
		setFilter,
	] );
};
