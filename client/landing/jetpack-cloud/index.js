/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';

import { navigation, siteSelection, sites } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';
import { dashboard } from 'landing/jetpack-cloud/sections/dashboard/controller';
import {
	backups,
	backupDetail,
	backupDownload,
	backupRestore,
} from 'landing/jetpack-cloud/sections/backups/controller';
import { settings } from 'landing/jetpack-cloud/sections/settings/controller';

export default function() {
	page( '/', siteSelection, navigation, dashboard, makeLayout, clientRender );

	if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
		page( '/backups', siteSelection, sites, navigation, makeLayout, clientRender );
		page( '/backups/:site', siteSelection, navigation, backups, makeLayout, clientRender );
		page(
			'/backups/:site/detail',
			siteSelection,
			navigation,
			backupDetail,
			makeLayout,
			clientRender
		);
		page(
			'/backups/:site/detail/:backupId',
			siteSelection,
			navigation,
			backupDetail,
			makeLayout,
			clientRender
		);
		page(
			'/backups/:site/download/:rewindId',
			siteSelection,
			navigation,
			backupDownload,
			makeLayout,
			clientRender
		);

		if ( config.isEnabled( 'jetpack-cloud/backups-restore' ) ) {
			page( '/backups/restore', siteSelection, sites, navigation, makeLayout, clientRender );
			page(
				'/backups/:site/restore',
				siteSelection,
				navigation,
				backupRestore,
				makeLayout,
				clientRender
			);
			page(
				'/backups/:site/restore/:restoreId',
				siteSelection,
				navigation,
				backupRestore,
				makeLayout,
				clientRender
			);
		}
	}

	if ( config.isEnabled( 'jetpack-cloud/settings' ) ) {
		page( '/settings', siteSelection, sites, navigation, makeLayout, clientRender );
		page( '/settings/:site', siteSelection, navigation, settings, makeLayout, clientRender );
	}
}
