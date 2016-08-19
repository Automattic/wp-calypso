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
	analytics = require( 'lib/analytics' );
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

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
		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Media', { textOnly: true } ) ) );

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
