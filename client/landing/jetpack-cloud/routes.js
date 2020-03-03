/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { normalize } from 'lib/route';
import { clientRender, makeLayout, setupSidebar, sites, siteSelection } from './controller';
import { dashboard } from './sections/dashboard/controller';
import {
	backups,
	backupDetail,
	backupDownload,
	backupRestore,
} from './sections/backups/controller';
import { scan, scanHistory } from './sections/scan/controller';
import { settings } from './sections/settings/controller';

const router = () => {
	page( '*', normalize );

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
			page( '/scan/:site/history', siteSelection, setupSidebar, scanHistory, makeLayout, clientRender );
		}
	}

	if ( config.isEnabled( 'jetpack-cloud/settings' ) ) {
		page( '/settings', siteSelection, sites, setupSidebar, makeLayout, clientRender );
		page( '/settings/:site', siteSelection, setupSidebar, settings, makeLayout, clientRender );
	}
};

export default router;
