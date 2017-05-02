/**
 * External dependencies
 */
import config from 'config';
import debugFactory from 'debug';
import page from 'page';
import React from 'react';

const debug = debugFactory( 'calypso:store-sidebar' );

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import ProductCreate from './app/products/product-create';
import Dashboard from './app/dashboard';
import SettingsPayments from './app/settings/payments';
import StatsController from './app/stats/controller';
import StoreSidebar from './store-sidebar';

const storePages = [
	{
		container: Dashboard,
		configKey: 'woocommerce/extension-dashboard',
		path: '/store/:site',
		sidebarItem: {
			icon: 'house',
			isPrimary: true,
			label: 'Dashboard',
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
			label: 'Products',
			slug: 'products',
		},
	},
	{
		container: ProductCreate,
		configKey: 'woocommerce/extension-products',
		path: '/store/products/:site/add',
		sidebarItemButton: {
			label: 'Add',
			parentSlug: 'products',
			slug: 'product-add',
		},
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-products-import',
		path: '/store/products/:site/import',
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-orders',
		path: '/store/orders/:site',
		sidebarItem: {
			icon: 'pages',
			isPrimary: true,
			label: 'Orders',
			slug: 'orders',
		},
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-orders',
		path: '/store/orders/:site/add',
		sidebarItemButton: {
			label: 'Add',
			parentSlug: 'orders',
			slug: 'order-add',
		},
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-promotions',
		path: '/store/promotions/:site',
		sidebarItem: {
			icon: 'money',
			isPrimary: true,
			label: 'Promotions',
			slug: 'promotions',
		},
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-extensions',
		path: '/store/extensions/:site',
		sidebarItem: {
			icon: 'plugins',
			isPrimary: false,
			label: 'Extensions',
			slug: 'extensions',
		},
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-settings',
		path: '/store/settings/:site',
		sidebarItem: {
			icon: 'cog',
			isPrimary: false,
			label: 'Settings',
			slug: 'settings',
		},
	},
	{
		container: SettingsPayments,
		configKey: 'woocommerce/extension-settings-payments',
		path: '/store/settings/:site/payments',
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-settings-shipping',
		path: '/store/settings/:site/shipping',
	},
	{
		container: Dashboard, // TODO use Dashboard as a placeholder until this page becomes available
		configKey: 'woocommerce/extension-settings-tax',
		path: '/store/settings/:site/tax',
	},
];

function getStoreSidebarItems() {
	return storePages.filter( storePage => storePage.sidebarItem ).map( storePage => {
		return { path: storePage.path, ...storePage.sidebarItem };
	} );
}

function getStoreSidebarItemButtons() {
	return storePages.filter( storePage => storePage.sidebarItemButton ).map( storePage => {
		return { path: storePage.path, ...storePage.sidebarItemButton };
	} );
}

function addStorePage( storePage, storeNavigation ) {
	page( storePage.path, siteSelection, storeNavigation, function( context ) {
		renderWithReduxStore(
			React.createElement( storePage.container, { className: 'woocommerce' } ),
			document.getElementById( 'primary' ),
			context.store
		);
	} );
}

function createStoreNavigation( context, next ) {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	debug( 'rendering store nav now, context.path:', context.path );

	renderWithReduxStore(
		React.createElement(
			StoreSidebar, {
				path: context.path,
				site: selectedSite,
				sidebarItems: getStoreSidebarItems(),
				sidebarItemButtons: getStoreSidebarItemButtons(),
			}
		),
		document.getElementById( 'secondary' ),
		context.store
	);

	next();
}

export default function() {
	// Add pages that use the store navigation
	storePages.forEach( function( storePage ) {
		if ( config.isEnabled( storePage.configKey ) ) {
			addStorePage( storePage, createStoreNavigation );
		}
	} );

	// Add pages that use my-sites navigation instead
	if ( config.isEnabled( 'woocommerce/extension-stats' ) ) {
		page( '/store/stats/:type/:period/:site', siteSelection, navigation, StatsController );
	}
}
