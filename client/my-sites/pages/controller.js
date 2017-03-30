/**
 * External Dependencies
 */
var React = require( 'react' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	analytics = require( 'lib/analytics' ),
	titlecase = require( 'to-title-case' ),
	trackScrollPage = require( 'lib/track-scroll-page' ),
	setTitle = require( 'state/document-head/actions' ).setDocumentHeadTitle;

var controller = {

	pages: function(context, next) {
	    var Pages = require( 'my-sites/pages/main' ),
			siteID = route.getSiteFragment( context.path ),
			status = context.params.status,
			search = context.query.s,
			basePath = route.sectionify( context.path ),
			analyticsPageTitle = 'Pages',
			baseAnalyticsPath;

		status = ( ! status || status === siteID ) ? '' : status;
		context.store.dispatch( setTitle( i18n.translate( 'Pages', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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

		context.primary = React.createElement( Pages, {
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
		} );
		next();
	}
};

module.exports = controller;
