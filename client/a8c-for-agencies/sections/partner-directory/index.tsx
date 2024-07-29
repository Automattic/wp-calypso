import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	A4A_OVERVIEW_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { PARTNER_DIRECTORY_DASHBOARD_SLUG } from './constants';
import { partnerDirectoryDashboardContext } from './controller';

export default function () {
	// Check if the Partner Directory is not enabled
	if ( ! config.isEnabled( 'a4a-partner-directory' ) ) {
		// Redirect user to the Overview page
		page.redirect( A4A_OVERVIEW_LINK );
		// And return now and don't config the Partner Directory routes.
		return;
	}

	// Redirect to the Dashboard page: /partner-directory/dashboard
	page( A4A_PARTNER_DIRECTORY_LINK, () => {
		page.redirect( `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }` );
	} );

	page(
		`${ A4A_PARTNER_DIRECTORY_LINK }/:section?`,
		requireAccessContext,
		partnerDirectoryDashboardContext,
		makeLayout,
		clientRender
	);
}
