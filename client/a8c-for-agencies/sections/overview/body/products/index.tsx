import page from '@automattic/calypso-router';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Offering from 'calypso/a8c-for-agencies/components/offering';
import { OfferingItemProps } from 'calypso/a8c-for-agencies/components/offering/types';
import {
	PRODUCT_BRAND_FILTER_JETPACK,
	PRODUCT_BRAND_FILTER_WOOCOMMERCE,
} from 'calypso/a8c-for-agencies/sections/marketplace/constants';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WooCommerceLogo from 'calypso/components/woocommerce-logo';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

import './style.scss';

const A4A_PRODUCTS_MARKETPLACE_LINK = '/marketplace/products';

const OverviewBodyProducts = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const actionHandlerCallback = useCallback(
		( section: string, product: string ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_overview_click_open_marketplace', {
					section,
					product,
				} )
			);
		},
		[ dispatch ]
	);

	const jetpack: OfferingItemProps = {
		//translators: Title for the action card
		title: translate( 'Jetpack' ),
		titleIcon: <JetpackLogo size={ 26 } />,
		description: translate(
			'Jetpack offers best-in-class security, performance, and growth tools for WordPress. Install only the products you need, or purchase bundles for a complete site at greater savings.'
		),
		highlights: [
			translate( 'Optimize your site speed in a few clicks.' ),
			translate( 'Back up your site in real-time as you edit.' ),
			translate( 'Create better content with AI.' ),
			translate( 'Automatically block comment & form spam.' ),
			translate( 'Stay safe with malware firewall & one-click fixes.' ),
			translate( 'Get advanced site stats and traffic insights.' ),
		],
		// translators: Button navigating to A4A Marketplace
		buttonTitle: translate( 'View all Jetpack products' ),
		expanded: true,
		actionHandler: () => {
			actionHandlerCallback( 'products', 'jetpack' );
			page( `${ A4A_PRODUCTS_MARKETPLACE_LINK }/${ PRODUCT_BRAND_FILTER_JETPACK }` );
		},
	};

	const woo: OfferingItemProps = {
		//translators: Title for the action card
		title: translate( 'WooCommerce' ),
		titleIcon: <WooCommerceLogo className="a4a-overview-products__woocommerce-logo" size={ 40 } />,
		description: translate(
			'WooCommerce is the platform that offers unlimited potential to build the perfect ecommerce experiences for your clients. No matter what success looks like, you can do it with WooCommerce. Purchase Woo extensions in bulk to save big.'
		),
		highlights: [
			translate( 'AutomateWoo: Grow sales with less effort using powerful marketing automation.' ),
			translate( 'Bookings: Offer appointment bookings, reservations, or equipment rentals.' ),
			translate(
				'Min/Max Quantities: Set min and max rules for products, orders, and categories.'
			),
			translate( 'Product Add-Ons: Offer add-ons like gift wrapping, special messages, and more.' ),
			translate(
				'Product Bundles: Offer personalized bundles, bulk discounts, and assembled products.'
			),
			translate( 'Subscriptions: Enable weekly, monthly, or annual subscriptions.' ),
			translate( 'WooPayments Referrals: Coming soon.' ),
		],
		// translators: Button navigating to A4A Marketplace
		buttonTitle: translate( 'View all WooCommerce products' ),
		expanded: true,
		actionHandler: () => {
			actionHandlerCallback( 'products', 'woocommerce' );
			page( `${ A4A_PRODUCTS_MARKETPLACE_LINK }/${ PRODUCT_BRAND_FILTER_WOOCOMMERCE }` );
		},
	};

	return (
		<Offering
			title={ translate( 'Products' ) }
			description={ translate(
				'Add services to create sites, increase security and performance, and provide excellent shopping experiences for your clients’ sites.'
			) }
			items={ [ woo, jetpack ] }
		/>
	);
};

export default OverviewBodyProducts;
