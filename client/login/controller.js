/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import WPLogin from './wp-login';

export default {
	login: function( context ) {
		if ( config.isEnabled( 'wp-login' ) ) {
			renderWithReduxStore(
				<WPLogin />,
				'primary',
				context.store
			);
		}
	}
};
