import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { A4A_MARKETPLACE_CHECKOUT_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useShoppingCart from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-shopping-cart';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import WooPaymentsFeaturedCard from './featured-card';
import useWooPaymentsProduct from './hooks/use-get-woopayments-product';

import './style.scss';

const DISMISSED_PREFERENCE = 'a4a_woopayments_featured_overview_card_dismissed';

export default function OverviewSidebarFeaturedWooPayments() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { setSelectedCartItems } = useShoppingCart();

	const product = useWooPaymentsProduct();

	const onDismiss = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_featured_woopayments_dismiss_click' ) );
		dispatch( savePreference( DISMISSED_PREFERENCE, true ) );
	}, [ dispatch ] );

	const onAddToCart = useCallback( () => {
		if ( ! product ) {
			return;
		}
		setSelectedCartItems( [
			{
				...product,
				quantity: 1,
			},
		] );
		dispatch( recordTracksEvent( 'calypso_a4a_overview_woopayments_add_to_cart_click' ) );

		page( `${ A4A_MARKETPLACE_CHECKOUT_LINK }` );
	}, [ dispatch, product, setSelectedCartItems ] );

	const isDismissed = useSelector( ( state ) => getPreference( state, DISMISSED_PREFERENCE ) );

	if ( isDismissed || ! product ) {
		return null;
	}

	return (
		<WooPaymentsFeaturedCard
			products={ [ product ] }
			onSelectProduct={ onAddToCart }
			onDismiss={ onDismiss }
			customCTALabel={ translate( 'Add to cart and checkout' ) }
		/>
	);
}
