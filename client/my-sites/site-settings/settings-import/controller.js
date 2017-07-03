/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import ImportSettings from 'my-sites/site-settings/settings-import/main';

export default {
	importSite( context ) {
		renderWithReduxStore(
			<ImportSettings />,
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
