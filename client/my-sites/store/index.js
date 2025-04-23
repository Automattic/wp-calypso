import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { createElement } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import StatsController from './app/store-stats/controller';
import './style.scss';

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
