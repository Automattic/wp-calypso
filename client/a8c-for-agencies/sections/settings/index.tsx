import page from '@automattic/calypso-router';
import { A4A_SETTINGS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { SETTINGS_AGENCY_PROFILE_TAB } from './constants';
import { settingsContext } from './controller';

export default function () {
	// todo: we have only one tab, this redirect /settings to /settings/agency-profile
	page( A4A_SETTINGS_LINK, () => {
		page.redirect( `${ A4A_SETTINGS_LINK }/${ SETTINGS_AGENCY_PROFILE_TAB }` );
	} );

	page(
		`${ A4A_SETTINGS_LINK }/:tab`,
		requireAccessContext,
		settingsContext,
		makeLayout,
		clientRender
	);
}
