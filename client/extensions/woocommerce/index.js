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
import App from './app';

import controller from 'my-sites/controller';
import EmptyContent from 'components/empty-content';
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import installActionHandlers from './state/data-layer';
import Order from './app/order';
import Orders from './app/orders';
import Products from './app/products';
import ProductCreate from './app/products/product-create';
import ProductUpdate from './app/products/product-update';
import Dashboard from './app/dashboard';
import SettingsPayments from './app/settings/payments';
import Development from './app/settings/development';
import SettingsTaxes from './app/settings/taxes';
import Shipping from './app/settings/shipping';
import ShippingZone from './app/settings/shipping/shipping-zone';
import StatsController from './app/store-stats/controller';
import StoreSidebar from './store-sidebar';

function initExtension() {
	installActionHandlers();
}

const getStorePages = () => {
	return [
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
			container: Development,
			configKey: 'woocommerce/extension-settings-development',
			documentTitle: translate( 'Development' ),
			path: '/store/settings/development/:site',
		},
	];
};

function addStorePage( storePage, storeNavigation ) {
	page( storePage.path, siteSelection, storeNavigation, function( context ) {
		const component = React.createElement( storePage.container, { params: context.params } );
		const appProps = storePage.documentTitle && { documentTitle: storePage.documentTitle } || {};
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
			line: translate( 'Sorry, the page you were looking for doesn\'t exist or has been moved.' ),
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
			addStorePage( storePage, ( context, next ) => createStoreNavigation( context, next, storePage ) );
		}
	} );

	// Add pages that use my-sites navigation instead
	page( '/store/stats/:type/:unit', controller.siteSelection, controller.sites );
	page( '/store/stats/:type/:unit/:site', siteSelection, navigation, StatsController );

	page(
		'/store/*',
		notFoundError
	);
}

// TODO: This could probably be done in a better way through the same mechanisms
// that bring in the rest of the extension code. Maybe extension-loader?
initExtension();
