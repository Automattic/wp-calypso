/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {

	drafts: function( context ) {
		var Drafts = require( 'my-sites/drafts/main' ),
			siteID = route.getSiteFragment( context.path );

		titleActions.setTitle( i18n.translate( 'Drafts', { textOnly: true } ), { siteID: siteID } );

		ReactDom.render(
			React.createElement( Drafts, {
				siteID: siteID,
				sites: sites,
				trackScrollPage: function() {}
			} ),
			document.getElementById( 'primary' )
		);
	}

};
