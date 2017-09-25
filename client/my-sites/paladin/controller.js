/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import PaladinComponent from './main';

export default {
	activate: function( context ) {
		renderWithReduxStore(
			React.createElement( PaladinComponent ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

