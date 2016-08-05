/**
 * External Dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';

/**
 * Internal Dependencies
 */
import route from 'lib/route';
import titleActions from 'lib/screen-title/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import PaladinComponent from './main';

module.exports = {
	activate: function( context ) {
		const siteID = route.getSiteFragment( context.path );

		titleActions.setTitle( i18n.translate( 'Paladin', { textOnly: true } ), { siteID: siteID } );

		renderWithReduxStore(
			React.createElement( PaladinComponent ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

