/** @format */

/**
 * External dependencies
 */

import config from 'config';
import page from 'page';
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import App from './app';
import Dashboard from './app/dashboard';
import EmptyContent from 'components/empty-content';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import installActionHandlers from './state/data-layer';
import Order from './app/order';
import OrderCreate from './app/order/order-create';
import Orders from './app/orders';
import ProductCategories from './app/product-categories';
import Products from './app/products';
import ProductCreate from './app/products/product-create';
import ProductUpdate from './app/products/product-update';
import Promotions from './app/promotions';
import PromotionCreate from './app/promotions/promotion-create';
import PromotionUpdate from './app/promotions/promotion-update';
import Reviews from './app/reviews';
import SettingsPayments from './app/settings/payments';
import SettingsEmail from './app/settings/email';
import SettingsTaxes from './app/settings/taxes';
import Shipping from './app/settings/shipping';
import ShippingZone from './app/settings/shipping/shipping-zone';
import StatsController from './app/store-stats/controller';
import StoreSidebar from './store-sidebar';

function initExtension() {
	installActionHandlers();
}

const getStorePages = () => {
	const pages = [
		{
			container: Dashboard,
			configKey: 'woocommerce/extension-dashboard',
			path: '/store/:site',
		},
		{
			container: Products,
			configKey: 'woocommerce/extension-products',
			documentTitle: translate( 'Products' ),
			path: '/store/products/:site',
		},
		{
			container: ProductCreate,
			configKey: 'woocommerce/extension-products',
			documentTitle: translate( 'New Product' ),
			path: '/store/product/:site',
		},
		{
			container: ProductUpdate,
			configKey: 'woocommerce/extension-products',
			documentTitle: translate( 'Edit Product' ),
			path: '/store/product/:site/:product',
		},
		{
			container: ProductCategories,
			configKey: 'woocommerce/extension-product-categories',
			documentTitle: translate( 'Product Categories' ),
			path: '/store/products/categories/:site',
		},
		{
			container: Orders,
			configKey: 'woocommerce/extension-orders',
			documentTitle: translate( 'Orders' ),
			path: '/store/orders/:site',
		},
		{
			container: Orders,
			configKey: 'woocommerce/extension-orders',
			documentTitle: translate( 'Orders' ),
			path: '/store/orders/:filter/:site',
		},
		{
			container: Order,
			configKey: 'woocommerce/extension-orders',
			documentTitle: translate( 'Order Details' ),
			path: '/store/order/:site/:order',
		},
		{
			container: OrderCreate,
			configKey: 'woocommerce/extension-orders-create',
			documentTitle: translate( 'New Order' ),
			path: '/store/order/:site/',
		},
		{
			container: Promotions,
			configKey: 'woocommerce/extension-promotions',
			documentTitle: translate( 'Promotions' ),
			path: '/store/promotions/:site',
		},
		{
			container: PromotionCreate,
			configKey: 'woocommerce/extension-promotions',
			documentTitle: translate( 'New Promotion' ),
			path: '/store/promotion/:site',
		},
		{
			container: PromotionUpdate,
			configKey: 'woocommerce/extension-promotions',
			documentTitle: translate( 'Edit Promotion' ),
			path: '/store/promotion/:site/:promotion',
		},
		{
			container: Reviews,
			configKey: 'woocommerce/extension-reviews',
			documentTitle: translate( 'Reviews' ),
			path: '/store/reviews/:site',
		},
		{
			container: Reviews,
			configKey: 'woocommerce/extension-reviews',
			documentTitle: translate( 'Reviews' ),
			path: '/store/reviews/:filter/:site',
		},
		{
			container: Reviews,
			configKey: 'woocommerce/extension-reviews',
			documentTitle: translate( 'Reviews' ),
			path: '/store/reviews/:productId/:filter/:site',
		},
		{
			container: SettingsPayments,
			configKey: 'woocommerce/extension-settings',
			documentTitle: translate( 'Payment Settings' ),
			path: '/store/settings/:site',
		},
		{
			container: SettingsPayments,
			configKey: 'woocommerce/extension-settings-payments',
			documentTitle: translate( 'Payment Settings' ),
			path: '/store/settings/payments/:site',
		},
		{
			container: Shipping,
			configKey: 'woocommerce/extension-settings-shipping',
			documentTitle: translate( 'Shipping Settings' ),
			path: '/store/settings/shipping/:site',
		},
		{
			container: ShippingZone,
			configKey: 'woocommerce/extension-settings-shipping',
			documentTitle: translate( 'Shipping Settings' ),
			path: '/store/settings/shipping/zone/:site/:zone?',
		},
		{
			container: SettingsTaxes,
			configKey: 'woocommerce/extension-settings-tax',
			documentTitle: translate( 'Tax Settings' ),
			path: '/store/settings/taxes/:site',
		},
		{
			container: SettingsEmail,
			configKey: 'woocommerce/extension-settings-email',
			documentTitle: translate( 'Email' ),
			path: '/store/settings/email/:site/:setup?',
		},
	];

	return pages;
};

function addStorePage( storePage, storeNavigation ) {
	page( storePage.path, siteSelection, storeNavigation, function( context ) {
		const component = React.createElement( storePage.container, { params: context.params } );
		const appProps =
			( storePage.documentTitle && { documentTitle: storePage.documentTitle } ) || {};

		let analyticsPath = storePage.path;
		const { filter } = context.params;
		if ( filter ) {
			analyticsPath = analyticsPath.replace( ':filter', filter );
		}

		let analyticsPageTitle = 'Store';
		if ( storePage.documentTitle ) {
			analyticsPageTitle += ` > ${ storePage.documentTitle }`;
		} else {
			analyticsPageTitle += ' > Dashboard';
		}

		analytics.pageView.record( analyticsPath, analyticsPageTitle );

		renderWithReduxStore(
			React.createElement( App, appProps, component ),
			document.getElementById( 'primary' ),
			context.store
		);
	} );
}

function createStoreNavigation( context, next, storePage ) {
	renderWithReduxStore(
		React.createElement( StoreSidebar, {
			path: context.path,
			page: storePage,
		} ),
		document.getElementById( 'secondary' ),
		context.store
	);

	next();
}

function notFoundError( context, next ) {
	renderWithReduxStore(
		React.createElement( EmptyContent, {
			className: 'content-404',
			illustration: '/calypso/images/illustrations/illustration-404.svg',
			title: translate( 'Uh oh. Page not found.' ),
			line: translate( "Sorry, the page you were looking for doesn't exist or has been moved." ),
		} ),
		document.getElementById( 'content' ),
		context.store
	);
	next();
}

export default function() {
	// Add pages that use the store navigation
	getStorePages().forEach( function( storePage ) {
		if ( config.isEnabled( storePage.configKey ) ) {
			addStorePage( storePage, ( context, next ) =>
				createStoreNavigation( context, next, storePage )
			);
		}
	} );

	// Add pages that use my-sites navigation instead
	page( '/store/stats/:type/:unit', siteSelection, sites );
	page( '/store/stats/:type/:unit/:site', siteSelection, navigation, StatsController );

	page( '/store/*', notFoundError );
}

// TODO: This could probably be done in a better way through the same mechanisms
// that bring in the rest of the extension code. Maybe extension-loader?
initExtension();
