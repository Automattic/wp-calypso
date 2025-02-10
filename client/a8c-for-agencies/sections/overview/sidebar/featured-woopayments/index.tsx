import page from '@automattic/calypso-router';
import { Badge, Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useShoppingCart from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-shopping-cart';
import WooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woopayments.svg';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import useWooPaymentsProduct from './hooks/use-get-woopayments-product';

import './style.scss';

const DISMISSED_PREFERENCE = 'a4a_woopayments_featured_overview_card_dismissed';

export default function OverviewSidebarFeaturedWooPayments() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showLightbox, setShowLightbox ] = useState( false );

	const { selectedCartItems, setSelectedCartItems } = useShoppingCart();

	const product = useWooPaymentsProduct();

	const onDismiss = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_featured_woopayments_dismiss_click' ) );
		dispatch( savePreference( DISMISSED_PREFERENCE, true ) );
	}, [ dispatch ] );

	const onAddToCart = useCallback( () => {
		if ( ! product ) {
			return;
		}
		const index = selectedCartItems.findIndex(
			( item ) => item.quantity === 1 && item.slug === product.slug
		);

		if ( index === -1 ) {
			// Item doesn't exist, add it
			setSelectedCartItems( [
				...selectedCartItems,
				{
					...product,
					quantity: 1,
				},
			] );
			dispatch( recordTracksEvent( 'calypso_a4a_overview_woopayments_add_to_cart_click' ) );
		}

		page( `${ A4A_MARKETPLACE_PRODUCTS_LINK }#cart` );
		setShowLightbox( false );
	}, [ dispatch, product, selectedCartItems, setSelectedCartItems ] );

	const isDismissed = useSelector( ( state ) => getPreference( state, DISMISSED_PREFERENCE ) );

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();

			dispatch( recordTracksEvent( 'calypso_overview_woopayments_view_details_click' ) );

			setShowLightbox( true );
		},
		[ dispatch ]
	);

	const onHideLightbox = useCallback( () => {
		setShowLightbox( false );
	}, [] );

	if ( isDismissed || ! product ) {
		return null;
	}

	return (
		<>
			<Card className="overview__featured-woopayments">
				<Button
					className="overview__featured-dismiss-button"
					variant="tertiary"
					icon={ close }
					onClick={ onDismiss }
				/>

				<Badge className="overview__featured-woopayments-badge">{ translate( 'Featured' ) }</Badge>

				<img
					className="overview__featured-woopayments-logo"
					src={ WooPaymentsLogo }
					alt="WooPayments"
				/>

				<div className="overview__featured-woopayments-content">
					<h3 className="overview__featured-woopayments-title">
						{ translate( 'Revenue share available' ) }
					</h3>

					<div className="overview__featured-woopayments-description">
						{ translate(
							"Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients' sites within Automattic for Agencies."
						) }
					</div>
				</div>

				<Button
					className="overview__featured-woopayments-button"
					variant="primary"
					__next40pxDefaultSize
					onClick={ onShowLightbox }
				>
					{ translate( 'View details and start earning' ) }
				</Button>
			</Card>

			{ showLightbox && (
				<LicenseLightbox
					product={ product }
					quantity={ 1 }
					ctaLabel={ translate( 'Add to cart' ) }
					isCTAPrimary
					onActivate={ onAddToCart }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
}
