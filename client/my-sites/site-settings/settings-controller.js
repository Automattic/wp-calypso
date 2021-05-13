/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import { recordPageView } from 'calypso/lib/analytics/page-view';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import titlecase from 'to-title-case';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { sectionify } from 'calypso/lib/route';

export function siteSettings( context, next ) {
	let analyticsPageTitle = 'Site Settings';
	const basePath = sectionify( context.path );
	const section = sectionify( context.path ).split( '/' )[ 2 ];
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

	// if site loaded, but user cannot manage site, redirect
	if ( site && ! canManageOptions ) {
		page.redirect( '/stats' );
		return;
	}

	// analytics tracking
	if ( 'undefined' !== typeof section ) {
		analyticsPageTitle += ' > ' + titlecase( section );
	}
	recordPageView( basePath + '/:site', analyticsPageTitle );

	next();
}

export function setScroll( context, next ) {
	window.scroll( 0, 0 );
	next();
}
