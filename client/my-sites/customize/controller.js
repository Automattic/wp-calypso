/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	Qs = require( 'qs' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	analytics = require( 'analytics' ),
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {

	customize: function( context ) {
		var CustomizeComponent = require( 'my-sites/customize/main' ),
			basePath = route.sectionify( context.path ),
			siteID = route.getSiteFragment( context.path );

		analytics.pageView.record( basePath, 'Customizer' );

		titleActions.setTitle( i18n.translate( 'Customizer', { textOnly: true } ), { siteID: siteID } );

		ReactDom.render(
			React.createElement( CustomizeComponent, {
				domain: context.params.domain || '',
				sites: sites,
				prevPath: context.prevPath || '',
				query: Qs.parse( context.querystring )
			} ),
			document.getElementById( 'primary' )
		);
	}

};
