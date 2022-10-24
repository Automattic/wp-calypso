import { LINK_IN_BIO_FLOW, addPlanToCart, createSiteWithCart } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import type { Step } from '../../types';
import './styles.scss';

const SiteCreationStep: Step = function SiteCreationStep( { navigation, flow } ) {
	const { siteTitle, domainItem, planCartItem, siteAccentColor } = useSelect( ( select ) => ( {
		siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
		domainItem: select( ONBOARD_STORE ).getDomainItem(),
		siteAccentColor: select( ONBOARD_STORE ).getSelectedSiteAccentColor(),
		planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
	} ) );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const theme = flow === LINK_IN_BIO_FLOW ? 'pub/lynx' : 'pub/lettre';
	const comingSoon = flow === LINK_IN_BIO_FLOW ? 1 : 0;
	const isPaidDomainItem = Boolean( domainItem?.product_slug );

	// if they have a paid domain, we hid the free plan for them
	const shouldHideFreePlan = ! isPaidDomainItem;

	async function createSite() {
		const site = await createSiteWithCart(
			flow as string,
			false,
			true,
			shouldHideFreePlan,
			domainItem,
			isPaidDomainItem,
			theme,
			comingSoon,
			'',
			siteAccentColor,
			true
		);

		await addPlanToCart( site?.siteSlug as string, planCartItem, flow as string, true, theme );

		return {
			siteSlug: site?.siteSlug,
		};
	}

	useEffect( () => {
		setPendingAction( createSite );
		navigation.submit?.();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
};

export default SiteCreationStep;
