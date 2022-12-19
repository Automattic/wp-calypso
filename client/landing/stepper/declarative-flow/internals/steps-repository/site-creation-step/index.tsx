import { Site } from '@automattic/data-stores';
import {
	ECOMMERCE_FLOW,
	isLinkInBioFlow,
	addPlanToCart,
	createSiteWithCart,
	isFreeFlow,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import {
	retrieveSignupDestination,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
	getSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import type { Step } from '../../types';

import './styles.scss';

const SiteCreationStep: Step = function SiteCreationStep( { navigation, flow } ) {
	const { submit } = navigation;

	const { domainCartItem, planCartItem, siteAccentColor } = useSelect( ( select ) => ( {
		domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
		siteAccentColor: select( ONBOARD_STORE ).getSelectedSiteAccentColor(),
		planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
	} ) );

	const username = useSelector( ( state ) => getCurrentUserName( state ) );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const theme = isLinkInBioFlow( flow ) ? 'pub/lynx' : 'pub/lettre';
	const isPaidDomainItem = Boolean( domainCartItem?.product_slug );

	// Default visibility is public
	let siteVisibility = Site.Visibility.PublicIndexed;

	// Link-in-bio flow defaults to "Coming Soon"
	if ( isLinkInBioFlow( flow ) || isFreeFlow( flow ) ) {
		siteVisibility = Site.Visibility.PublicNotIndexed;
	}

	// Ecommerce flow defaults to Private
	if ( flow === ECOMMERCE_FLOW ) {
		siteVisibility = Site.Visibility.Private;
	}

	const signupDestinationCookieExists = retrieveSignupDestination();
	const isReEnteringFlow = getSignupCompleteFlowName() === flow;
	//User has already reached checkout and then hit the browser back button.
	//In this case, site has already been created, and plan added to cart. We need to avoid to create another site.
	const isManageSiteFlow = Boolean(
		wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow
	);

	async function createSite() {
		if ( isManageSiteFlow ) {
			return {
				siteSlug: getSignupCompleteSlug(),
				goToCheckout: true,
			};
		}

		const site = await createSiteWithCart(
			flow as string,
			true,
			isPaidDomainItem,
			theme,
			siteVisibility,
			'',
			siteAccentColor,
			true,
			username,
			domainCartItem
		);

		if ( planCartItem ) {
			await addPlanToCart( site?.siteSlug as string, flow as string, true, theme, planCartItem );
		}

		return {
			siteSlug: site?.siteSlug,
			goToCheckout: Boolean( planCartItem ),
		};
	}

	useEffect( () => {
		if ( submit ) {
			setPendingAction( createSite );
			submit();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
};

export default SiteCreationStep;
