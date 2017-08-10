/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import SecurityMain from 'my-sites/site-settings/settings-security/main';

export default {
	security( context ) {
		renderWithReduxStore(
			React.createElement( SecurityMain ),
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
