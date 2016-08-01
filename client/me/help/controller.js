/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import titleActions from 'lib/screen-title/actions';
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';

module.exports = {
	help: function( context ) {
		var Help = require( './main' ),
			basePath = route.sectionify( context.path );

		titleActions.setTitle( i18n.translate( 'Help', { textOnly: true } ) );

		analytics.pageView.record( basePath, 'Help' );

		renderWithReduxStore(
			React.createElement( Help ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	contact: function( context ) {
		var ContactComponent = require( './help-contact' ),
			basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Help > Contact' );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		ReactDom.render(
			<ReduxProvider store={ context.store } >
				<ContactComponent clientSlug={ config( 'client_slug' ) } />
			</ReduxProvider>,
			document.getElementById( 'primary' )
		);
	}
};
