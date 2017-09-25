/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PaladinComponent from './main';
import { renderWithReduxStore } from 'lib/react-helpers';

export default {
	activate: function( context ) {
		renderWithReduxStore(
			React.createElement( PaladinComponent ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

