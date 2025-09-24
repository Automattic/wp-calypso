import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSearch } from '@automattic/domain-search';
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
		};
	}, [ props.events, items, flowName ] );

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
