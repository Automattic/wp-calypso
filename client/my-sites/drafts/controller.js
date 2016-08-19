/**
 * External Dependencies
 */
var React = require( 'react'),
	i18n = require( 'i18n-calypso' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	titleActions = require( 'lib/screen-title/actions' );
import { renderWithReduxStore } from 'lib/react-helpers';

module.exports = {

	drafts: function( context ) {
		var Drafts = require( 'my-sites/drafts/main' ),
			siteID = route.getSiteFragment( context.path );

		titleActions.setTitle( i18n.translate( 'Drafts', { textOnly: true } ), { siteID: siteID } );

		renderWithReduxStore(
			React.createElement( Drafts, {
				siteID: siteID,
				sites: sites,
				trackScrollPage: function() {}
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}

};
