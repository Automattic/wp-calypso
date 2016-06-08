/**
 * External Dependencies
 */
var React = require( 'react' ),
	i18n = require( 'i18n-calypso' ),
	page = require( 'page' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	analytics = require( 'lib/analytics' ),
	titlecase = require( 'to-title-case' ),
	AdsUtils = require( 'lib/ads/utils' ),
	titleActions = require( 'lib/screen-title/actions' ),
	utils = require( 'lib/site/utils' );
import { renderWithReduxStore } from 'lib/react-helpers';

function _recordPageView( context, analyticsPageTitle ) {
	var basePath = route.sectionify( context.path );
	if ( 'undefined' !== typeof context.params.section ) {
		analyticsPageTitle += ' > ' + titlecase( context.params.section );
	}

	analytics.ga.recordPageView( basePath + '/:site', analyticsPageTitle );
}

function _getLayoutTitle( context ) {
	var title = sites.getSelectedSite().jetpack ? 'AdControl' : 'WordAds';
	switch ( context.params.section ) {
		case 'earnings':
			return i18n.translate( '%(wordads)s Earnings', { args: { wordads: title } } );
		case 'settings':
			return i18n.translate( '%(wordads)s Settings', { args: { wordads: title } } );
	}
}

module.exports = {

	redirect: function( context ) {
		page.redirect( '/ads/earnings/' + context.params.site_id );
		return;
	},

	layout: function( context ) {
		var Ads = require( 'my-sites/ads/main' ),
			pathSuffix = sites.selected ? '/' + sites.selected : '',
			layoutTitle = _getLayoutTitle( context ),
			site = sites.getSelectedSite();

		titleActions.setTitle( layoutTitle, { siteID: context.params.site_id } );

		if ( ! utils.userCan( 'manage_options', site ) ) {
			page.redirect( '/stats' + pathSuffix );
			return;
		}

		if ( ! AdsUtils.canAccessWordads( site ) ) {
			page.redirect( '/stats' + pathSuffix );
			return;
		}

		_recordPageView( context, layoutTitle );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		renderWithReduxStore(
			React.createElement( Ads, {
				site: site,
				section: context.params.section,
				path: context.path,
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
