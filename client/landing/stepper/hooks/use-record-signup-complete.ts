import { isDomainTransfer, isDomainMapping } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import { useCallback } from 'react';
import { USER_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { SIGNUP_DOMAIN_ORIGIN, recordSignupComplete } from 'calypso/lib/analytics/signup';
import { useStore } from 'calypso/state';
import isUserRegistrationDaysWithinRange from 'calypso/state/selectors/is-user-registration-days-within-range';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { useSite } from './use-site';
import type { UserSelect, OnboardSelect } from '@automattic/data-stores';

export const useRecordSignupComplete = ( flow: string | null ) => {
	const site = useSite();
	const store = useStore();
	const state = store.getState();
	const siteId = site?.ID || null;
	const theme = site?.options?.theme_slug || '';
	const { domainCartItem, planCartItem, siteCount, selectedDomain } = useSelect( ( select ) => {
		return {
			siteCount: ( select( USER_STORE ) as UserSelect ).getCurrentUser()?.site_count,
			domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			selectedDomain: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
		};
	}, [] );
	const isNewishUser = isUserRegistrationDaysWithinRange( state, null, 0, 7 );
	const dependencies = getSignupDependencyStore( state );

	return useCallback( () => {
		const isNewUser = !! ( dependencies && dependencies.username );

		const isNew7DUserSite = !! (
			isNewUser ||
			( isNewishUser && dependencies && dependencies?.siteSlug && siteCount && siteCount <= 1 )
		);

		// Domain product slugs can be a domain purchases like dotcom_domain or dotblog_domain or a mapping like domain_mapping
		// When purchasing free subdomains the product_slugs is empty (since there is no actual produce being purchased)
		// so we avoid capturing the product slug in these instances.
		const domainProductSlug = domainCartItem?.product_slug ?? undefined;

		// Domain cart items can sometimes be included when free. So the selected domain is explicitly checked to see if it's free.
		// For mappings and transfers this attribute should be empty but it needs to be checked.
		const hasCartItems = !! ( domainProductSlug || planCartItem ); // see the function `dependenciesContainCartItem()

		// When there is no plan put in the cart, `planCartItem` is `null` instead of `undefined` like domainCartItem.
		// It worths a investigation of whether the both should behave the same.
		const planProductSlug = planCartItem?.product_slug ?? undefined;
		// To have a paid domain item it has to either be a paid domain or a different domain product like mapping or transfer.
		const hasPaidDomainItem =
			( selectedDomain && ! selectedDomain.is_free ) || !! domainProductSlug;

		recordSignupComplete(
			{
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
				isMapping:
					hasPaidDomainItem && domainCartItem ? isDomainMapping( domainCartItem ) : undefined,
				isTransfer:
					hasPaidDomainItem && domainCartItem ? isDomainTransfer( domainCartItem ) : undefined,
				signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.NOT_SET,
			},
			true
		);
	}, [ domainCartItem, flow, planCartItem, selectedDomain, siteCount, siteId, theme ] );
};
