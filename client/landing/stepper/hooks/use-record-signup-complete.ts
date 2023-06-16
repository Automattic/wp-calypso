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

		recordSignupComplete(
			{
				flow,
				siteId,
				isNewUser,
				hasCartItems: domainCartItem !== null || planCartItem !== null,
				isNew7DUserSite,
				theme,
				intent: flow,
				startingPoint: flow,
				isBlankCanvas: theme?.includes( 'blank-canvas' ),
				domainProductSlug:
					domainCartItem && isDomainRegistration( domainCartItem ) && domainCartItem.product_slug,
				planProductSlug: planCartItem && planCartItem.product_slug,
				isMapping: domainCartItem && isDomainMapping( domainCartItem ),
				isTransfer: domainCartItem && isDomainTransfer( domainCartItem ),
			},
			true
		);
	}, [ flow, siteId, siteCount, theme, domainCartItem, planCartItem ] );
};
