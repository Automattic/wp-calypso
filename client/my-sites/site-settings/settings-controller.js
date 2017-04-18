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
import utils from 'lib/site/utils';
import { getSelectedSite } from 'state/ui/selectors';

export default {
	siteSettings( context, next ) {
		let analyticsPageTitle = 'Site Settings';
		const basePath = route.sectionify( context.path );
		const site = getSelectedSite( context.store.getState() );
		const section = sectionify( context.path ).split( '/' )[ 2 ];

		// if site loaded, but user cannot manage site, redirect
		if ( site && ! utils.userCan( 'manage_options', site ) ) {
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
	}
};
