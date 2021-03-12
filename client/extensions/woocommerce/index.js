/**
 * External dependencies
 */

import page from 'page';
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import App from './app';
import Dashboard from './app/dashboard';
import EmptyContent from 'calypso/components/empty-content';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import installActionHandlers from './state/data-layer';
import reducer from './state/reducer';
import StatsController from './app/store-stats/controller';
import StoreSidebar from './store-sidebar';
import { tracksStore, bumpStat } from './lib/analytics';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSelectedSiteWithFallback, getSiteOption } from 'calypso/state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const getStorePages = () => {
	const pages = [
		{
			path: '/store/:site',
		},
		{
			path: '/store/products/:site',
			statName: 'products',
		},
		{
			path: '/store/product/:site',
			statName: 'new-product',
		},
		{
			path: '/store/product/:site/:product_id',
			statName: 'edit-product',
		},
		{
			path: '/store/products/categories/:site',
			statName: 'product-categories',
		},
		{
			path: '/store/products/category/:site/:category_id',
			statName: 'edit-product-category',
		},
		{
			path: '/store/products/category/:site',
			statName: 'new-product-category',
		},
		{
			path: '/store/orders/:site',
			statName: 'orders',
		},
		{
			path: '/store/orders/:filter/:site',
			statName: 'orders',
		},
		{
			path: '/store/order/:site/:order_id',
			statName: 'order-details',
		},
		{
			path: '/store/order/:site/',
			statName: 'new-order',
		},
		{
			path: '/store/promotions/:site',
			statName: 'promotions',
		},
		{
			path: '/store/promotion/:site',
			statName: 'new-promotion',
		},
		{
			path: '/store/promotion/:site/:promotion_id',
			statName: 'edit-promotion',
		},
		{
			path: '/store/reviews/:site',
			statName: 'reviews',
		},
		{
			path: '/store/reviews/:filter/:site',
			statName: 'reviews',
		},
		{
			path: '/store/reviews/:product_id/:filter/:site',
			statName: 'reviews',
		},
		{
			path: '/store/settings/:site',
			statName: 'payment-settings',
		},
		{
			path: '/store/settings/payments/:site',
			statName: 'payment-settings',
		},
		{
			path: '/store/settings/shipping/:site',
			statName: 'shipping-settings',
		},
		{
			path: '/store/settings/shipping/zone/:site/:zone?',
			statName: 'shipping-settings',
		},
		{
			path: '/store/settings/taxes/:site',
			statName: 'tax-settings',
		},
		{
			path: '/store/settings/email/:site/:setup?',
			statName: 'email',
		},
	];

	return pages;
};

function getAnalyticsPath( path, params ) {
	if ( '/store/settings/:site' === path ) {
		return '/store/settings/payments/:site';
	}

	if ( '/store/settings/email/:site/:setup?' === path ) {
		return params.setup ? '/store/settings/email/:site/:setup' : '/store/settings/email/:site';
	}

	if ( '/store/settings/shipping/zone/:site/:zone?' === path ) {
		return params.zone
			? '/store/settings/shipping/zone/:site/:zone'
			: '/store/settings/shipping/zone/:site';
	}

	return path.replace( '?', '' ).replace( ':filter', params.filter );
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

function redirectIfWooCommerceNotInstalled( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;
	const isSiteWpcomStore = getSiteOption( state, siteId, 'is_wpcom_store' );

	if ( ! isSiteWpcomStore ) {
		return page.redirect( `/woocommerce-installation/${ site.slug }` );
	}

	next();
}

export default async function ( _, addReducer ) {
	await addReducer( [ 'extensions', 'woocommerce' ], reducer );
	installActionHandlers();

	// Without site param
	page(
		'/store',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		sites,
		makeLayout,
		clientRender
	);

	// Dashboard
	page(
		'/store/:site',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		( context, next ) => {
			const component = React.createElement( Dashboard, {
				params: context.params,
			} );
			const appProps = {
				documentTitle: null,
				isDashboard: true,
				analyticsPath: getAnalyticsPath( '/store/:site', context.params ),
				analyticsTitle: 'Store > Dashboard',
			};

			context.primary = React.createElement( App, appProps, component );

			context.secondary = React.createElement( StoreSidebar, { path: context.path } );

			next();
		},
		addTracksContext,
		makeLayout,
		clientRender
	);

	// Redirect all other pages to the dashboard, to show the Store removal notice
	getStorePages().forEach( function ( storePage ) {
		page( storePage.path, redirectIfWooCommerceNotInstalled, addTracksContext, ( context ) => {
			context.store.dispatch( bumpStat( 'calypso_store_post_sunset', storePage.statName ) );
			page.redirect( `/store/${ context.params.site }?${ context.querystring }` );
		} );
	} );

	// Add pages that use my-sites navigation instead
	page(
		'/store/stats/:type/:unit',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		sites,
		addTracksContext,
		makeLayout,
		clientRender
	);
	page(
		'/store/stats/:type/:unit/:site',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		navigation,
		addTracksContext,
		StatsController,
		makeLayout,
		clientRender
	);

	page( '/store/*', notFoundError, makeLayout, clientRender );
}
