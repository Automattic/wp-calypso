/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	clientRender,
	makeLayout,
	setupSidebar,
	sites,
	siteSelection,
} from 'landing/jetpack-cloud/controller';
import { dashboard } from 'landing/jetpack-cloud/sections/dashboard/controller';
import {
	backups,
	backupDetail,
	backupDownload,
	backupRestore,
} from 'landing/jetpack-cloud/sections/backups/controller';
import { scan, scanHistory } from 'landing/jetpack-cloud/sections/scan/controller';
import { settings } from 'landing/jetpack-cloud/sections/settings/controller';

export default function() {
	page( '/', siteSelection, setupSidebar, dashboard, makeLayout, clientRender );

	if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
		page( '/backups', siteSelection, sites, setupSidebar, makeLayout, clientRender );
		page( '/backups/:site', siteSelection, setupSidebar, backups, makeLayout, clientRender );
		page(
			'/backups/:site/detail',
			siteSelection,
			setupSidebar,
			backupDetail,
			makeLayout,
			clientRender
		);
		page(
			'/backups/:site/detail/:backupId',
			siteSelection,
			setupSidebar,
			backupDetail,
			makeLayout,
			clientRender
		);
		page(
			'/backups/:site/download',
			siteSelection,
			setupSidebar,
			backupDownload,
			makeLayout,
			clientRender
		);
		page(
			'/site/:site/backups/backups/download/:downloadId',
			setupSidebar,
			backupDownload,
			makeLayout,
			clientRender
		);

		if ( config.isEnabled( 'jetpack-cloud/backups-restore' ) ) {
			page( '/backups/restore', siteSelection, sites, setupSidebar, makeLayout, clientRender );
			page(
				'/backups/:site/restore',
				siteSelection,
				setupSidebar,
				backupRestore,
				makeLayout,
				clientRender
			);
			page(
				'/backups/:site/restore/:restoreId',
				siteSelection,
				setupSidebar,
				backupRestore,
				makeLayout,
				clientRender
			);
		}
	}

	if ( config.isEnabled( 'jetpack-cloud/scan' ) ) {
		page( '/scan', siteSelection, sites, setupSidebar, makeLayout, clientRender );
		page( '/scan/:site', siteSelection, setupSidebar, scan, makeLayout, clientRender );

		if ( config.isEnabled( 'jetpack-cloud/scan-history' ) ) {
			page(
				'/scan/:site/history',
				siteSelection,
				setupSidebar,
				scanHistory,
				makeLayout,
				clientRender
			);
		}
	}

	if ( config.isEnabled( 'jetpack-cloud/settings' ) ) {
		page( '/settings', siteSelection, sites, setupSidebar, makeLayout, clientRender );
		page( '/settings/:site', siteSelection, setupSidebar, settings, makeLayout, clientRender );
	}
}
