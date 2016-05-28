/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import i18n from 'lib/mixins/i18n';
import route from 'lib/route';
import titleActions from 'lib/screen-title/actions';
import config from 'config';

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
			<ReduxProvider store={ context.store } >
				<ContactComponent clientSlug={ config( 'client_slug' ) } />
			</ReduxProvider>,
			document.getElementById( 'primary' )
		);
	}
};
