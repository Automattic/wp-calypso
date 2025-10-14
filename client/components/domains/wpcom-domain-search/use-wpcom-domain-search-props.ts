import { DomainSearch } from '@automattic/domain-search';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps } from 'react';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { mergeObjectFunctions } from '../../../lib/merge-object-functions';
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
	isFirstDomainFreeForFirstYear = false,
	flowAllowsMultipleDomainsInCart,
	analyticsSection,
	query,
	config: externalConfig,
	events: externalEvents,
}: WPCOMDomainSearchProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sitelessCartKey = isLoggedIn ? 'no-site' : 'no-user';
	const cartKey = currentSiteId ?? sitelessCartKey;

	const {
		onContinue: externalOnContinue,
		beforeAddDomainToCart: externalBeforeAddDomainToCart,
		...otherExternalEvents
	} = externalEvents;

	const { cart, isNextDomainFree, onContinue } = useWPCOMDomainSearchCart( {
		cartKey,
		flowName,
		isFirstDomainFreeForFirstYear,
		flowAllowsMultipleDomainsInCart,
		onContinue: externalOnContinue,
		beforeAddDomainToCart: externalBeforeAddDomainToCart,
	} );

	const config = useMemo( () => {
		return {
			...externalConfig,
			priceRules: {
				...externalConfig?.priceRules,
				freeForFirstYear: isNextDomainFree,
			},
		};
	}, [ externalConfig, isNextDomainFree ] );

	const analyticsEvents = useWPCOMDomainSearchEvents( {
		vendor: config.vendor,
		flowName,
		analyticsSection,
		query: query,
	} );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			...mergeObjectFunctions( analyticsEvents, otherExternalEvents ),
			onContinue,
		};
	}, [ analyticsEvents, otherExternalEvents, onContinue ] );

	return {
		config,
		cart,
		events,
	};
};
