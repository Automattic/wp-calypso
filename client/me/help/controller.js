/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' );

import config from 'config';

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	i18n = require( 'lib/mixins/i18n' ),
	route = require( 'lib/route' ),
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {
	help: function( context ) {
		var Help = require( './main' ),
			basePath = route.sectionify( context.path );

		titleActions.setTitle( i18n.translate( 'Help', { textOnly: true } ) );

		analytics.pageView.record( basePath, 'Help' );

		ReactDom.render(
			React.createElement( Help ),
			document.getElementById( 'primary' )
		);
	},

	contact: function( context ) {
		var ContactComponent = require( './help-contact' ),
			basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Help > Contact' );

		ReactDom.render(
			<ContactComponent clientSlug={ config( 'client_slug' ) } />,
			document.getElementById( 'primary' )
		);
	}
};
