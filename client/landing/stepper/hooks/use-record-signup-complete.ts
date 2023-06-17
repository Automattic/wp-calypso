import {
	isDomainRegistration,
	isDomainTransfer,
	isDomainMapping,
} from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import { useCallback } from 'react';
import { USER_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordSignupComplete } from 'calypso/lib/analytics/signup';
import { useSite } from './use-site';
import type { UserSelect, OnboardSelect } from '@automattic/data-stores';

export const useRecordSignupComplete = ( flow: string | null ) => {
	const site = useSite();
	const siteId = site?.ID || null;
	const theme = site?.options?.theme_slug || '';
	const { domainCartItem, planCartItem, siteCount } = useSelect( ( select ) => {
		return {
			siteCount: ( select( USER_STORE ) as UserSelect ).getCurrentUser()?.site_count,
			domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			planCartItem: ( select( ONBOARD_STORE ) as OnboardSelct ).getPlanCartItem(),
		};
	}, [] );

	return useCallback( () => {
		// FIXME: once moving to the Stepper verion of User step,
		// wire the value of `isNewUser()` from the user store.
		const isNewUser = ! siteCount;

		// FIXME:
		// currently it's impossible to derive this data since it requires
		// the length of registration, so I use isNewUser here as an approximation
		const isNew7DUserSite = isNewUser;

		// FIXME:
		// the domain store considers a free domain a domain registration and will populate a domainCartItem object.
		// Thus the only way to check whether it's a free domain for now is whether domainCarItem is undefined or the product_slug is an empty string.
		// This behavior worths a revisit. It's also why we can't check hasCartItems as simply as domainCartItem || planCartItem
		const domainProductSlug =
			domainCartItem &&
			isDomainRegistration( domainCartItem ) &&
			( domainCartItem.product_slug === '' ? undefined : domainCarItem.product_slug );
		const hasCartItems = Boolean( domainProductSlug || planCartItem ); // see the function `dependenciesContainCartItem()

		// TBD:
		// When there is no plan put in the cart, `planCartItem` is `null` instead of `undefined` like domainCartItem.
		// It worths a investigation of whether the both should behave the same so this code can be simplified.
		const planProductSlug = planCartItem !== null ? planCartItem.product_slug : undefined;

		recordSignupComplete( {
			flow,
			siteId,
			isNewUser,
			hasCartItems,
			isNew7DUserSite,
			theme,
			intent: flow,
			startingPoint: flow,
			isBlankCanvas: theme?.includes( 'blank-canvas' ),
			planProductSlug,
			domainProductSlug,
			isMapping: domainCartItem && isDomainMapping( domainCartItem ),
			isTransfer: domainCartItem && isDomainTransfer( domainCartItem ),
		} );
	}, [ flow, siteId, siteCount, theme, domainCartItem, planCartItem ] );
};
