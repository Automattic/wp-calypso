/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';

export default {
	preferences( context ) {
		const AppPreferencesComponent = require( 'me/app-preferences/main' );

		renderWithReduxStore(
			React.createElement(
				AppPreferencesComponent
			),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
