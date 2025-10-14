import { DomainSearch } from '@automattic/domain-search';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps } from 'react';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useWPCOMDomainSearchCart } from './use-wpcom-domain-search-cart';
import { useWPCOMDomainSearchEvents } from './use-wpcom-domain-search-events';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

export type WPCOMDomainSearchProps = Omit<
	ComponentProps< typeof DomainSearch >,
	'cart' | 'events'
> & {
	currentSiteId?: number;
	flowName: string;
	events: Omit< Required< ComponentProps< typeof DomainSearch > >[ 'events' ], 'onContinue' > & {
		onContinue: ( items: ResponseCartProduct[] ) => void;
		beforeAddDomainToCart?: ( domain: MinimalRequestCartProduct ) => MinimalRequestCartProduct;
	};
	isFirstDomainFreeForFirstYear?: boolean;
	flowAllowsMultipleDomainsInCart: boolean;
	analyticsSection: string;
};

export const useWPCOMDomainSearchProps = ( {
	currentSiteId,
	flowName,
	isFirstDomainFreeForFirstYear,
	flowAllowsMultipleDomainsInCart,
	analyticsSection,
	query,
	config: externalConfig,
	events: externalEvents,
}: WPCOMDomainSearchProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sitelessCartKey = isLoggedIn ? 'no-site' : 'no-user';
	const cartKey = currentSiteId ?? sitelessCartKey;

	const { cart, isNextDomainFree, onContinue } = useWPCOMDomainSearchCart( {
		cartKey,
		flowName,
		isFirstDomainFreeForFirstYear: isFirstDomainFreeForFirstYear || false,
		flowAllowsMultipleDomainsInCart,
		onContinue: externalEvents.onContinue,
		beforeAddDomainToCart: externalEvents.beforeAddDomainToCart,
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

	const analyticsEvents = useWPCOMDomainSearchEvents( {
		vendor: config.vendor,
		flowName,
		analyticsSection,
		query: query,
	} );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			...analyticsEvents,
			...externalEvents,
			onContinue,
			onQueryChange: ( query ) => {
				analyticsEvents.onQueryChange?.( query );
				externalEvents.onQueryChange?.( query );
			},
			onSkip: ( suggestion ) => {
				analyticsEvents.onSkip?.( suggestion );
				externalEvents.onSkip?.( suggestion );
			},
			onExternalDomainClick: ( domainName ) => {
				analyticsEvents.onExternalDomainClick?.( domainName );
				externalEvents.onExternalDomainClick?.( domainName );
			},
		};
	}, [ analyticsEvents, externalEvents, onContinue ] );

	return {
		config,
		cart,
		events,
	};
};
