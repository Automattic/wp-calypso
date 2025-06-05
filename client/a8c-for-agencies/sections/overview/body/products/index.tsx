import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Offering from 'calypso/a8c-for-agencies/components/offering';
import { OfferingItemProps } from 'calypso/a8c-for-agencies/components/offering/types';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	PRODUCT_BRAND_FILTER_JETPACK,
	PRODUCT_BRAND_FILTER_WOOCOMMERCE,
} from 'calypso/a8c-for-agencies/sections/marketplace/constants';
import WooLogoColor from 'calypso/assets/images/icons/Woo_logo_color.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

import './style.scss';

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
		},
		href: addQueryArgs( A4A_MARKETPLACE_PRODUCTS_LINK, {
			category: PRODUCT_BRAND_FILTER_JETPACK,
		} ),
	};

	const woo: OfferingItemProps = {
		//translators: Title for the action card
		title: translate( 'WooCommerce' ),
		titleIcon: <img width={ 40 } src={ WooLogoColor } alt="WooCommerce" />,
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
			translate(
				'WooPayments: Earn a recurring 5bps commission on Total Payment Volume (TPV) for any new clients referred. {{a}}Learn{{nbsp/}}more ↗{{/a}}',
				{
					components: {
						a: (
							<a
								href="https://automattic.com/for-agencies/program-incentives/"
								target="_blank"
								rel="noreferrer noopener"
							/>
						),
						nbsp: <>&nbsp;</>,
					},
				}
			) as string,
		],
		// translators: Button navigating to A4A Marketplace
		buttonTitle: translate( 'View all WooCommerce products' ),
		expanded: true,
		actionHandler: () => {
			actionHandlerCallback( 'products', 'woocommerce' );
		},
		href: addQueryArgs( A4A_MARKETPLACE_PRODUCTS_LINK, {
			category: PRODUCT_BRAND_FILTER_WOOCOMMERCE,
		} ),
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
