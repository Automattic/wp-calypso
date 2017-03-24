/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import SiteSettingsGeneral from 'my-sites/site-settings/general/main';
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();

export default {
	general( context ) {
		const site = sites.getSelectedSite();

		renderWithReduxStore(
			React.createElement( SiteSettingsGeneral, {
				...{ site }
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
