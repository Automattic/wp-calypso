/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	qs = require( 'querystring' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	analytics = require( 'analytics' ),
	titlecase = require( 'to-title-case' ),
	trackScrollPage = require( 'lib/track-scroll-page' ),
	titleActions = require( 'lib/screen-title/actions' );

var controller = {

	pages: function( context ) {
		var Pages = require( 'my-sites/pages/main' ),
			siteID = route.getSiteFragment( context.path ),
			status = context.params.status,
			search = qs.parse( context.querystring ).s,
			basePath = route.sectionify( context.path ),
			analyticsPageTitle = 'Pages',
			baseAnalyticsPath;

		status = ( ! status || status === siteID ) ? '' : status;
		titleActions.setTitle( i18n.translate( 'Pages', { textOnly: true } ), { siteID: siteID } );

		if ( siteID ) {
			baseAnalyticsPath = basePath + '/:site';
		} else {
			baseAnalyticsPath = basePath;
		}

		if ( status.length ) {
			analyticsPageTitle += ' > ' + titlecase( status );
		} else {
			analyticsPageTitle += ' > Published';
		}

		analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

		ReactDom.render(
			React.createElement( Pages, {
				context: context,
				siteID: siteID,
				status: status,
				sites: sites,
				search: search,
				trackScrollPage: trackScrollPage.bind(
					null,
					baseAnalyticsPath,
					analyticsPageTitle,
					'Pages'
				)
			} ),
			document.getElementById( 'primary' )
		);
	}
};

module.exports = controller;
