/** @format */
/**
 * External Dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import { sectionify } from 'lib/route/path';
import titlecase from 'to-title-case';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { canCurrentUser } from 'state/selectors';

export default {
	siteSettings( context, next ) {
		let analyticsPageTitle = 'Site Settings';
		const basePath = route.sectionify( context.path );
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
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );

		next();
	},

	setScroll( context, next ) {
		window.scroll( 0, 0 );
		next();
	},
};
