/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import i18n from 'lib/mixins/i18n';
import route from 'lib/route';
import titleActions from 'lib/screen-title/actions';

export default {
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
		var HelpContact = require( './help-contact' ),
			basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Help > Contact' );

		ReactDom.render(
			<Provider store={ context.store }>
				<HelpContact />
			</Provider>,
			document.getElementById( 'primary' )
		);
	}
};
