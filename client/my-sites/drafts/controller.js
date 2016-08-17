/**
 * External Dependencies
 */
var React = require( 'react'),
	i18n = require( 'i18n-calypso' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' );
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { renderWithReduxStore } from 'lib/react-helpers';

module.exports = {

	drafts: function( context ) {
		var Drafts = require( 'my-sites/drafts/main' ),
			siteID = route.getSiteFragment( context.path );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Drafts', { textOnly: true } ) ) );

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
