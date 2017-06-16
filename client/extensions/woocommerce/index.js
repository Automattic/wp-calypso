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
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import installActionHandlers from './state/data-layer';
import ProductCreate from './app/products/product-create';
import Dashboard from './app/dashboard';
import SettingsPayments from './app/settings/payments';
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
			sidebarItem: {
				icon: 'house',
				isPrimary: true,
				label: translate( 'Dashboard' ),
				slug: 'dashboard',
			},
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-products',
			path: '/store/products/:site',
			sidebarItem: {
				icon: 'product',
				isPrimary: true,
				label: translate( 'Products' ),
				slug: 'products',
			},
		},
		{
			container: ProductCreate,
			configKey: 'woocommerce/extension-products',
			path: '/store/product/:site',
			sidebarItemButton: {
				label: translate( 'Add' ),
				parentSlug: 'products',
				slug: 'product-add',
			},
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-products-import',
			path: '/store/products/import/:site',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-orders',
			path: '/store/orders/:site',
			sidebarItem: {
				icon: 'pages',
				isPrimary: true,
				label: translate( 'Orders' ),
				slug: 'orders',
			},
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-orders',
			path: '/store/order/:site',
			sidebarItemButton: {
				label: translate( 'Add' ),
				parentSlug: 'orders',
				slug: 'order-add',
			},
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-settings',
			path: '/store/settings/:site',
			sidebarItem: {
				icon: 'cog',
				isPrimary: false,
				label: translate( 'Settings' ),
				slug: 'settings',
			},
		},
		{
			container: SettingsPayments,
			configKey: 'woocommerce/extension-settings-payments',
			path: '/store/settings/payments/:site',
			sidebarItem: {
				isPrimary: false,
				label: translate( 'Payments' ),
				parentSlug: 'settings',
				slug: 'settings-payments',
			},
		},
		{
			container: Shipping,
			configKey: 'woocommerce/extension-settings-shipping',
			path: '/store/settings/shipping/:site',
			sidebarItem: {
				isPrimary: false,
				label: translate( 'Shipping' ),
				parentSlug: 'settings',
				slug: 'settings-shipping',
			},
		},
		{
			container: ShippingZone,
			configKey: 'woocommerce/extension-settings-shipping',
			path: '/store/settings/shipping/:site/zone/:zone',
		},
		{
			container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
			configKey: 'woocommerce/extension-settings-tax',
			path: '/store/settings/taxes/:site',
			sidebarItem: {
				isPrimary: false,
				label: translate( 'Taxes' ),
				parentSlug: 'settings',
				slug: 'settings-tax',
			},
		},
	];
};

function getStoreSidebarItems() {
	return getStorePages().filter( storePage => storePage.sidebarItem ).map( storePage => {
		return { path: storePage.path, ...storePage.sidebarItem };
	} );
}

function getStoreSidebarItemButtons() {
	return getStorePages().filter( storePage => storePage.sidebarItemButton ).map( storePage => {
		return { path: storePage.path, ...storePage.sidebarItemButton };
	} );
}

function addStorePage( storePage, storeNavigation ) {
	page( storePage.path, siteSelection, storeNavigation, function( context ) {
		renderWithReduxStore(
			React.createElement( storePage.container, { className: 'woocommerce', ...context.params } ),
			document.getElementById( 'primary' ),
			context.store
		);
	} );
}

function createStoreNavigation( context, next ) {
	renderWithReduxStore(
		React.createElement( StoreSidebar, {
			path: context.path,
			sidebarItems: getStoreSidebarItems(),
			sidebarItemButtons: getStoreSidebarItemButtons(),
		} ),
		document.getElementById( 'secondary' ),
		context.store
	);

	next();
}

export default function() {
	// Add pages that use the store navigation
	getStorePages().forEach( function( storePage ) {
		if ( config.isEnabled( storePage.configKey ) ) {
			addStorePage( storePage, createStoreNavigation );
		}
	} );

	// Add pages that use my-sites navigation instead
	if ( config.isEnabled( 'woocommerce/extension-stats' ) ) {
		page( '/store/stats/:type/:unit/:site', siteSelection, navigation, StatsController );
	}
}

// TODO: This could probably be done in a better way through the same mechanisms
// that bring in the rest of the extension code. Maybe extension-loader?
initExtension();

