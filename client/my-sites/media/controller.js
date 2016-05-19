/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react'),
	i18n = require( 'i18n-calypso' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	analytics = require( 'lib/analytics' ),
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {

	media: function( context ) {
		var MediaComponent = require( 'my-sites/media/main' ),
			filter = context.params.filter,
			search = context.query.s,
			baseAnalyticsPath = route.sectionify( context.path );

		// Analytics
		if ( sites.getSelectedSite() ) {
			baseAnalyticsPath += '/:site';
		}
		analytics.pageView.record( baseAnalyticsPath, 'Media' );

		// Page Title
		titleActions.setTitle( i18n.translate( 'Media', { textOnly: true } ), {
			siteID: route.getSiteFragment( context.path )
		} );

		// Render
		ReactDom.render(
			React.createElement( MediaComponent, {
				sites: sites,
				filter: filter,
				search: search
			} ),
			document.getElementById( 'primary' )
		);
	}

};
