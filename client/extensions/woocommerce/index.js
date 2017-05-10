/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import config from 'config';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import ProductCreate from './app/products/product-create';
import Dashboard from './app/dashboard';
import Checkout from './app/settings/checkout';
import StatsController from './app/stats/controller';

function addStorePage( storePage ) {
	page( storePage.route, siteSelection, navigation, function( context ) {
		renderWithReduxStore(
			React.createElement( storePage.container, { className: 'woocommerce' } ),
			document.getElementById( 'primary' ),
			context.store
		);
	} );
}

export default function() {
	const storePages = [
		{
			container: Dashboard,
			configKey: 'woocommerce/extension-dashboard',
			route: '/store/:site',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-products',
			route: '/store/products/:site',
		},
		{
			container: ProductCreate,
			configKey: 'woocommerce/extension-products',
			route: '/store/products/:site/add',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-products-import',
			route: '/store/products/:site/import',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-orders',
			route: '/store/orders/:site',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-orders',
			route: '/store/orders/:site/add',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-promotions',
			route: '/store/promotions/:site',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-extensions',
			route: '/store/extensions/:site',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-settings',
			route: '/store/settings/:site',
		},
		{
			container: Checkout,
			configKey: 'woocommerce/extension-settings-checkout',
			route: '/store/settings/:site/checkout',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-settings-shipping',
			route: '/store/settings/:site/shipping',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-settings-tax',
			route: '/store/settings/:site/tax',
		},
	];

	storePages.forEach( function( storePage ) {
		if ( config.isEnabled( storePage.configKey ) ) {
			addStorePage( storePage );
		}
	} );

	if ( config.isEnabled( 'woocommerce/extension-stats' ) ) {
		page( '/store/stats/:type/:period/:site', siteSelection, navigation, StatsController );
	}
}
