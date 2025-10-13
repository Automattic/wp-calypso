import { DomainSearch } from '@automattic/domain-search';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps } from 'react';
import { useSelector } from 'react-redux';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useDomainSearchEvents } from './use-domain-search-events';
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
	analyticsSection: string;
};

const DomainSearchWithCartAndAnalytics = ( {
	flowName,
	config: externalConfig,
	isFirstDomainFreeForFirstYear,
	flowAllowsMultipleDomainsInCart,
	analyticsSection,
	...props
}: DomainSearchProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sitelessCartKey = isLoggedIn ? 'no-site' : 'no-user';
	const cartKey = props.currentSiteId ?? sitelessCartKey;

	const { cart, isNextDomainFree, items } = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
		flowName,
		isFirstDomainFreeForFirstYear: isFirstDomainFreeForFirstYear || false,
		flowAllowsMultipleDomainsInCart,
		onContinue: props.events?.onContinue,
		beforeAddDomainToCart: props.events?.beforeAddDomainToCart,
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

	const analyticsEvents = useDomainSearchEvents( {
		vendor: config.vendor,
		flowName,
		analyticsSection,
		query: props.query,
	} );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			...analyticsEvents,
			...props.events,
			onQueryChange: ( query ) => {
				analyticsEvents.onQueryChange?.( query );
				props.events?.onQueryChange?.( query );
			},
			onContinue: () => {
				props.events?.onContinue?.( items );
			},
			onSkip: ( suggestion ) => {
				analyticsEvents.onSkip?.( suggestion );
				props.events?.onSkip?.( suggestion );
			},
			onExternalDomainClick: ( domainName ) => {
				analyticsEvents.onExternalDomainClick?.( domainName );
				props.events?.onExternalDomainClick?.( domainName );
			},
		};
	}, [ analyticsEvents, props.events, items ] );

	return <DomainSearch { ...props } config={ config } cart={ cart } events={ events } />;
};

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<CalypsoShoppingCartProvider>
			<DomainSearchWithCartAndAnalytics { ...props } />
		</CalypsoShoppingCartProvider>
	);
};
