/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import WPLogin from './wp-login';

export default {
	login: function( context ) {
		renderWithReduxStore(
			<WPLogin />,
			'primary',
			context.store
		);

	}
};
