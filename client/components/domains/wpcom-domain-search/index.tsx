import { getNewRailcarId, recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSearch, getTld } from '@automattic/domain-search';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useDebounce } from '@wordpress/compose';
import { useCallback, useMemo, useRef, type ComponentProps } from 'react';
import { WPCOMDomainSearchCartProvider } from './domain-search-cart-provider';
import { useQueryHandler } from './use-query-handler';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

type DomainSearchProps = Omit< ComponentProps< typeof DomainSearch >, 'cart' | 'events' > & {
	currentSiteId?: number;
	flowName: string;
	events?: Omit< Required< ComponentProps< typeof DomainSearch > >[ 'events' ], 'onContinue' > & {
		onContinue?: ( items: ResponseCartProduct[] ) => void;
		beforeAddDomainToCart?: ( domain: MinimalRequestCartProduct ) => MinimalRequestCartProduct;
	};
	isFirstDomainFreeForFirstYear?: boolean;
	flowAllowsMultipleDomainsInCart: boolean;
};

const DomainSearchWithCart = ( {
	currentSiteId,
	currentSiteUrl,
	flowName,
	config: externalConfig,
	isFirstDomainFreeForFirstYear,
	flowAllowsMultipleDomainsInCart,
	...props
}: DomainSearchProps ) => {
	const cartKey = currentSiteId ?? 'no-site';
	const { onContinue, beforeAddDomainToCart } = props.events ?? {};
	const railcarId = useRef( getNewRailcarId( 'domain-suggestion' ) );

	const { query, setQuery } = useQueryHandler( {
		initialQuery: props.query,
		currentSiteUrl,
	} );

	const { cart, isNextDomainFree, items } = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
		flowName,
		isFirstDomainFreeForFirstYear: isFirstDomainFreeForFirstYear || false,
		flowAllowsMultipleDomainsInCart,
		onContinue,
		beforeAddDomainToCart,
	} );

	const cartItemsLength = cart.items.length;

	const config = useMemo( () => {
		return {
			...externalConfig,
			priceRules: {
				...externalConfig?.priceRules,
				freeForFirstYear:
					( cartItemsLength === 0 && isFirstDomainFreeForFirstYear ) || isNextDomainFree,
			},
		};
	}, [ externalConfig, isNextDomainFree, cartItemsLength, isFirstDomainFreeForFirstYear ] );

	const searchCount = useRef( 0 );
	const lastSearchTime = useRef( Date.now() );

	const triggerDomainSearchEvent = useCallback(
		( query: string ) => {
			searchCount.current++;
			const timeDiffFromLastSearchInSeconds = Math.floor(
				( Date.now() - lastSearchTime.current ) / 1000
			);
			lastSearchTime.current = Date.now();

			recordTracksEvent( 'calypso_domain_search', {
				search_box_value: query,
				search_count: searchCount.current,
				search_vendor: config.vendor,
				section: flowName === 'domain' ? 'domain-first' : 'signup',
				seconds_from_last_search: timeDiffFromLastSearchInSeconds,
				flow_name: flowName,
			} );
		},
		[ config.vendor, flowName ]
	);

	const debouncedDomainSearchEvent = useDebounce( triggerDomainSearchEvent, 10000 );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			...props.events,
			onQueryChange: ( query ) => {
				setQuery( query );
				railcarId.current = getNewRailcarId( 'domain-suggestion' );
				debouncedDomainSearchEvent( query );
				props.events?.onQueryChange?.( query );
			},
			onContinue: () => {
				props.events?.onContinue?.( items );
			},
			onAddDomainToCart: ( domainName, position, isPremium, rootVendor ) => {
				recordTracksEvent( 'calypso_domain_search_add_button_click', {
					domain: domainName,
					position,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
					is_premium: isPremium,
					flow_name: flowName,
					root_vendor: rootVendor,
				} );
			},
			onQueryAvailabilityCheck: ( status, domainName, responseTime ) => {
				recordTracksEvent( 'calypso_domain_search_results_availability_receive', {
					available_status: status,
					flow_name: flowName,
					response_time: responseTime,
					search_query: domainName,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
				} );
			},
			onDomainAddAvailabilityPreCheck: ( unavailableStatus, domainName, rootVendor ) => {
				recordTracksEvent( 'calypso_domain_add_availability_precheck', {
					domain: domainName,
					flow_name: flowName,
					root_vendor: rootVendor,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
					unavailable_status: unavailableStatus,
				} );
			},
			onFilterApplied: ( filter ) => {
				recordTracksEvent( 'calypso_domain_search_filters_submit', {
					flow_name: flowName,
					filters_tlds: filter.tlds?.join( ',' ),
					filters_exact_sld_matches_only: filter.exactSldMatchesOnly,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
				} );
			},
			onSuggestionsReceive: ( query, suggestions, responseTime ) => {
				recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
					search_query: query,
					results: suggestions.join( ';' ),
					response_time_ms: responseTime,
					result_count: suggestions.length,
					flow_name: flowName,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
				} );
			},
			onSuggestionRender: ( suggestion, reason ) => {
				let resultSuffix = '';
				if ( reason === 'recommended' ) {
					resultSuffix = '#recommended';
				} else if ( reason === 'best-alternative' ) {
					resultSuffix = '#best-alternative';
				}

				let fetchAlgo = '/domains/search/' + config.vendor;
				if ( flowName === 'domain-only' ) {
					fetchAlgo = fetchAlgo + '/domain-only';
				} else if ( flowName === 'signup' ) {
					fetchAlgo = fetchAlgo + '/signup';
				} else {
					fetchAlgo = fetchAlgo + '/domains';
				}

				recordTracksEvent( 'calypso_traintracks_render', {
					ui_position: suggestion.position,
					flow_name: flowName,
					railcar: `${ railcarId.current }-${ suggestion.position }`,
					fetch_algo: `${ fetchAlgo }/${ suggestion.vendor }`,
					root_vendor: suggestion.vendor,
					rec_result: `${ suggestion.domain_name }${ resultSuffix }`,
					fetch_query: query,
					domain_type: suggestion.is_premium ? 'premium' : 'standard',
					tld: getTld( suggestion.domain_name ),
				} );
			},
			onSuggestionInteract: ( suggestion ) => {
				recordTracksEvent( 'calypso_traintracks_interact', {
					railcar: `${ railcarId.current }-${ suggestion.position }`,
					action: 'domain_added_to_cart',
					domain: suggestion.domain_name,
					root_vendor: suggestion.vendor,
				} );
			},
			onSuggestionNotFound: ( domainName ) => {
				recordTracksEvent( 'calypso_domain_click_missing_from_results', {
					domain: domainName,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
					flow_name: flowName,
					search_query: query,
					type: 'domain',
				} );
			},
			onTrademarkClaimsNoticeShown: ( suggestion ) => {
				recordTracksEvent( 'calypso_show_trademark_notice_click', {
					domain_name: suggestion.domain_name,
					section: 'somains',
				} );
			},
			onTrademarkClaimsNoticeClosed: ( suggestion ) => {
				recordTracksEvent( 'calypso_choose_another_domain_trademark_notice_click', {
					domain_name: suggestion.domain_name,
					section: 'domains',
				} );
			},
			onTrademarkClaimsNoticeAccepted: ( suggestion ) => {
				recordTracksEvent( 'calypso_acknowledge_trademark_notice_click', {
					domain_name: suggestion.domain_name,
					section: 'domains',
				} );
			},
		};
	}, [
		props.events,
		items,
		flowName,
		config.vendor,
		query,
		setQuery,
		debouncedDomainSearchEvent,
	] );

	return (
		<DomainSearch
			{ ...props }
			currentSiteUrl={ currentSiteUrl }
			config={ config }
			cart={ cart }
			events={ events }
		/>
	);
};

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<WPCOMDomainSearchCartProvider>
			<DomainSearchWithCart { ...props } />
		</WPCOMDomainSearchCartProvider>
	);
};
