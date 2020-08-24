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
import Dashboard from './app/dashboard';
import EmptyContent from 'components/empty-content';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import installActionHandlers from './state/data-layer';
import reducer from './state/reducer';
import Order from './app/order';
import OrderCreate from './app/order/create';
import Orders from './app/orders';
import ProductCategories from './app/product-categories';
import ProductCategoryCreate from './app/product-categories/create';
import ProductCategoryUpdate from './app/product-categories/update';
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
import { tracksStore } from './lib/analytics';
import { makeLayout, render as clientRender } from 'controller';

/**
 * Style dependencies
 */
import './style.scss';

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
			documentTitle: translate( 'New product' ),
			path: '/store/product/:site',
		},
		{
			container: ProductUpdate,
			configKey: 'woocommerce/extension-products',
			documentTitle: translate( 'Edit product' ),
			path: '/store/product/:site/:product_id',
		},
		{
			container: ProductCategories,
			configKey: 'woocommerce/extension-product-categories',
			documentTitle: translate( 'Product categories' ),
			path: '/store/products/categories/:site',
		},
		{
			container: ProductCategoryUpdate,
			configKey: 'woocommerce/extension-product-categories',
			documentTitle: translate( 'Edit product category' ),
			path: '/store/products/category/:site/:category_id',
		},
		{
			container: ProductCategoryCreate,
			configKey: 'woocommerce/extension-product-categories',
			documentTitle: translate( 'New product category' ),
			path: '/store/products/category/:site',
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
			documentTitle: translate( 'Order details' ),
			path: '/store/order/:site/:order_id',
		},
		{
			container: OrderCreate,
			configKey: 'woocommerce/extension-orders-create',
			documentTitle: translate( 'New order' ),
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
			documentTitle: translate( 'New promotion' ),
			path: '/store/promotion/:site',
		},
		{
			container: PromotionUpdate,
			configKey: 'woocommerce/extension-promotions',
			documentTitle: translate( 'Edit promotion' ),
			path: '/store/promotion/:site/:promotion_id',
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
			path: '/store/reviews/:product_id/:filter/:site',
		},
		{
			container: SettingsPayments,
			configKey: 'woocommerce/extension-settings',
			documentTitle: translate( 'Payment settings' ),
			path: '/store/settings/:site',
		},
		{
			container: SettingsPayments,
			configKey: 'woocommerce/extension-settings-payments',
			documentTitle: translate( 'Payment settings' ),
			path: '/store/settings/payments/:site',
		},
		{
			container: Shipping,
			configKey: 'woocommerce/extension-settings-shipping',
			documentTitle: translate( 'Shipping settings' ),
			path: '/store/settings/shipping/:site',
		},
		{
			container: ShippingZone,
			configKey: 'woocommerce/extension-settings-shipping',
			documentTitle: translate( 'Shipping settings' ),
			path: '/store/settings/shipping/zone/:site/:zone?',
		},
		{
			container: SettingsTaxes,
			configKey: 'woocommerce/extension-settings-tax',
			documentTitle: translate( 'Tax settings' ),
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

function getAnalyticsPath( path, params ) {
	if ( '/store/settings/:site' === path ) {
		return '/store/settings/payments/:site';
	}

	if ( '/store/settings/email/:site/:setup?' === path ) {
		return !! params.setup ? '/store/settings/email/:site/:setup' : '/store/settings/email/:site';
	}

	if ( '/store/settings/shipping/zone/:site/:zone?' === path ) {
		return !! params.zone
			? '/store/settings/shipping/zone/:site/:zone'
			: '/store/settings/shipping/zone/:site';
	}

	return path.replace( '?', '' ).replace( ':filter', params.filter );
}

function addStorePage( storePage, storeNavigation ) {
	page(
		storePage.path,
		siteSelection,
		storeNavigation,
		( context, next ) => {
			const component = React.createElement( storePage.container, { params: context.params } );
			const appProps = {
				documentTitle: storePage.documentTitle || null,
				isDashboard: '/store/:site' === storePage.path,
			};
			appProps.analyticsPath = getAnalyticsPath( storePage.path, context.params );
			appProps.analyticsTitle = `Store > ${
				storePage.documentTitle ? storePage.documentTitle : 'Dashboard'
			}`;

			context.primary = React.createElement( App, appProps, component );
			next();
		},
		addTracksContext,
		makeLayout,
		clientRender
	);
}

function createStoreNavigation( context, next, storePage ) {
	context.secondary = React.createElement( StoreSidebar, {
		path: context.path,
		page: storePage,
	} );

	next();
}

function notFoundError( context, next ) {
	context.primary = React.createElement( EmptyContent, {
		className: 'content-404',
		illustration: '/calypso/images/illustrations/illustration-404.svg',
		title: translate( 'Uh oh. Page not found.' ),
		line: translate( "Sorry, the page you were looking for doesn't exist or has been moved." ),
	} );
	next();
}

function addTracksContext( context, next ) {
	tracksStore.setReduxStore( context.store );

	next();
}

export default async function ( _, addReducer ) {
	await addReducer( [ 'extensions', 'woocommerce' ], reducer );
	installActionHandlers();

	page( '/store', siteSelection, sites, makeLayout, clientRender );

	// Add pages that use the store navigation
	getStorePages().forEach( function ( storePage ) {
		if ( config.isEnabled( storePage.configKey ) ) {
			addStorePage( storePage, ( context, next ) =>
				createStoreNavigation( context, next, storePage )
			);
		}
	} );

	// Add pages that use my-sites navigation instead
	page(
		'/store/stats/:type/:unit',
		siteSelection,
		sites,
		addTracksContext,
		makeLayout,
		clientRender
	);
	page(
		'/store/stats/:type/:unit/:site',
		siteSelection,
		navigation,
		addTracksContext,
		StatsController,
		makeLayout,
		clientRender
	);

	page( '/store/*', notFoundError, makeLayout, clientRender );
}
