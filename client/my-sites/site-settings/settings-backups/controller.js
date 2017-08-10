/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import BackupsMain from 'my-sites/site-settings/settings-backups/main';

export default {
	backups( context ) {
		renderWithReduxStore(
			React.createElement( BackupsMain ),
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
