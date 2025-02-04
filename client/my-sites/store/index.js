import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { createElement } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import App from './app';
import Dashboard from './app/dashboard';
import StatsController from './app/store-stats/controller';
import { bumpStat } from './lib/analytics';
import StoreSidebar from './store-sidebar';
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
	context.primary = createElement( EmptyContent, {
		className: 'content-404',
		illustration: '/calypso/images/illustrations/illustration-404.svg',
		title: translate( 'Uh oh. Page not found.' ),
		line: translate( "Sorry, the page you were looking for doesn't exist or has been moved." ),
	} );
	next();
}

function redirectIfWooCommerceNotInstalled( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if (
		site &&
		! isSiteStore( state, site.ID ) &&
		! getSiteOption( state, site.ID, 'is_wpcom_store' )
	) {
		page.redirect( `/woocommerce-installation/${ site.slug }` );
		return;
	}

	next();
}

export default async function () {
	// Without site param
	page( '/store', siteSelection, sites, makeLayout, clientRender );

	// Dashboard
	page(
		'/store/:site',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		( context, next ) => {
			const component = createElement( Dashboard, {
				params: context.params,
			} );
			const appProps = {
				analyticsPath: getAnalyticsPath( '/store/:site', context.params ),
				analyticsTitle: 'Store > Dashboard',
			};

			context.primary = createElement( App, appProps, component );

			context.secondary = createElement( StoreSidebar, { path: context.path } );

			next();
		},
		makeLayout,
		clientRender
	);

	// Redirect all other pages to the dashboard, to show the Store removal notice
	getStorePages().forEach( function ( storePage ) {
		page( storePage.path, redirectIfWooCommerceNotInstalled, ( context ) => {
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
		makeLayout,
		clientRender
	);
	page(
		'/store/stats/:type/:unit/:site',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		navigation,
		StatsController,
		makeLayout,
		clientRender
	);

	page( '/store/*', notFoundError, makeLayout, clientRender );
}
