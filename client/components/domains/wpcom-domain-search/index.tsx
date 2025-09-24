import { DomainSuggestion } from '@automattic/api-core';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSearch, getTld } from '@automattic/domain-search';
import { FilterState } from '@automattic/domain-search/src/components/search-bar/types';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps } from 'react';
import { WPCOMDomainSearchCartProvider } from './domain-search-cart-provider';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';
import type { MinimalRequestCartProduct, ResponseCartProduct } from '@automattic/shopping-cart';

type DomainSearchProps = Omit< ComponentProps< typeof DomainSearch >, 'cart' | 'events' > & {
	currentSiteId?: number;
	flowName: string;
	events?: Omit< Required< ComponentProps< typeof DomainSearch > >[ 'events' ], 'onContinue' > & {
		onContinue?: ( items: ResponseCartProduct[] ) => void;
		onAddDomainToCart?: ( domain: MinimalRequestCartProduct ) => MinimalRequestCartProduct;
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
	const { onContinue, onAddDomainToCart } = props.events ?? {};

	const { cart, isNextDomainFree, items } = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
		flowName,
		isFirstDomainFreeForFirstYear: isFirstDomainFreeForFirstYear || false,
		flowAllowsMultipleDomainsInCart,
		onContinue,
		onAddDomainToCart,
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

	const events = useMemo( () => {
		return {
			...props.events,
			onQueryChange: ( query: string ) => {
				props.events?.onQueryChange?.( query );
			},
			onContinue: () => {
				props.events?.onContinue?.( items );
			},
			onAddDomainToCart: (
				domainName: string,
				position: number,
				isPremium: boolean,
				rootVendor: string
			) => {
				recordTracksEvent( 'calypso_domain_search_add_button_click', {
					domain: domainName,
					position,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
					is_premium: isPremium,
					flow_name: flowName,
					root_vendor: rootVendor,
				} );
			},
			onQueryAvailabilityCheck: ( status: string, domainName: string, responseTime: number ) => {
				recordTracksEvent( 'calypso_domain_search_results_availability_receive', {
					available_status: status,
					flow_name: flowName,
					response_time: responseTime,
					search_query: domainName,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
				} );
			},
			onDomainAddAvailabilityPreCheck: (
				unavailableStatus: string | null,
				domainName: string,
				rootVendor: string
			) => {
				recordTracksEvent( 'calypso_domain_add_availability_precheck', {
					domain: domainName,
					flow_name: flowName,
					root_vendor: rootVendor,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
					unavailable_status: unavailableStatus,
				} );
			},
			onSearch: ( query: string, vendor: string, searchCount: number ) => {
				recordTracksEvent( 'calypso_domain_search', {
					search_box_value: query,
					search_count: searchCount,
					search_vendor: vendor,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
					// TODO: Not sure if we still need this
					// seconds_from_last_search:,
					flow_name: flowName,
				} );
			},
			onFilterApplied: ( filter: FilterState ) => {
				recordTracksEvent( 'calypso_domain_search_filters_submit', {
					flow_name: flowName,
					filters_tlds: filter.tlds?.join( ',' ),
					filters_exact_sld_matches_only: filter.exactSldMatchesOnly,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
				} );
			},
			onSuggestionsReceive: ( query: string, suggestions: string[] ) => {
				recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
					search_query: query,
					results: suggestions.join( ';' ),
					// response_time_ms: responseTime,
					result_count: suggestions.length,
					flow_name: flowName,
					section: flowName === 'domain' ? 'domain-first' : 'signup',
				} );
			},
			onSuggestionRender: (
				suggestion: DomainSuggestion,
				railcarId: string | null,
				reason?: string | null
			) => {
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
					railcar: `${ railcarId }-${ suggestion.position }`,
					fetch_algo: `${ fetchAlgo }/${ suggestion.vendor }`,
					root_vendor: suggestion.vendor,
					rec_result: `${ suggestion.domain_name }${ resultSuffix }`,
					fetch_query: getSessionStorageQuery(),
					domain_type: suggestion.is_premium ? 'premium' : 'standard',
					tld: getTld( suggestion.domain_name ),
				} );
			},
		};
	}, [ props.events, items, flowName, config ] );

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
