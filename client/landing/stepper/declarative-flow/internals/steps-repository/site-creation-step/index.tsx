import { LINK_IN_BIO_FLOW, addPlanToCart, createSiteWithCart } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getProductsList } from 'calypso/state/products-list/selectors';
import type { Step } from '../../types';
import './styles.scss';

const SiteCreationStep: Step = function SiteCreationStep( { navigation, flow } ) {
	const { domainCartItem, planCartItem, siteAccentColor } = useSelect( ( select ) => ( {
		domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
		siteAccentColor: select( ONBOARD_STORE ).getSelectedSiteAccentColor(),
		planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
	} ) );

	const productsList = useSelector( ( state ) => getProductsList( state ) );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const theme = flow === LINK_IN_BIO_FLOW ? 'pub/lynx' : 'pub/lettre';
	const comingSoon = flow === LINK_IN_BIO_FLOW ? 1 : 0;
	const isPaidDomainItem = Boolean( domainCartItem?.product_slug );

	async function createSite() {
		const site = await createSiteWithCart(
			flow as string,
			false,
			true,
			isPaidDomainItem,
			theme,
			comingSoon,
			'',
			siteAccentColor,
			true,
			productsList,
			domainCartItem
		);

		if ( planCartItem ) {
			await addPlanToCart(
				site?.siteSlug as string,
				flow as string,
				true,
				theme,
				productsList,
				planCartItem
			);
		}

		return {
			siteSlug: site?.siteSlug,
			goToCheckout: Boolean( planCartItem ),
		};
	}

	useEffect( () => {
		if ( navigation.submit ) {
			setPendingAction( createSite );
			navigation.submit();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
};

export default SiteCreationStep;
