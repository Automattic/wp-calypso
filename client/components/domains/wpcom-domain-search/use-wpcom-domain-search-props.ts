import { DomainSearch } from '@automattic/domain-search';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { mergeObjectFunctions } from '../../../lib/merge-object-functions';
import { recordDomainSearchStepSubmit } from './analytics';
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

export const getCartKey = ( {
	isLoggedIn,
	currentSiteId,
}: {
	isLoggedIn: boolean;
	currentSiteId?: number;
} ) => {
	const sitelessCartKey = isLoggedIn ? 'no-site' : 'no-user';
	return currentSiteId ?? sitelessCartKey;
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
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const {
		onContinue: externalOnContinue,
		beforeAddDomainToCart: externalBeforeAddDomainToCart,
		...otherExternalEvents
	} = externalEvents;

	const onContinueWithStepSubmissionTracking = useCallback(
		( items: ResponseCartProduct[] ) => {
			const firstItem = items[ 0 ];
			dispatch( recordDomainSearchStepSubmit( { domain_name: firstItem.meta }, analyticsSection ) );
			externalOnContinue( items );
		},
		[ dispatch, analyticsSection, externalOnContinue ]
	);

	const { cart, isNextDomainFree, onContinue } = useWPCOMDomainSearchCart( {
		cartKey: getCartKey( { isLoggedIn, currentSiteId } ),
		flowName,
		isFirstDomainFreeForFirstYear,
		flowAllowsMultipleDomainsInCart,
		onContinue: onContinueWithStepSubmissionTracking,
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
