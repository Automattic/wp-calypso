/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { normalize } from 'lib/route';
import { clientRender, makeLayout, setupSidebar, siteSelection } from './controller';
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

	page( '/', setupSidebar, dashboard, makeLayout, clientRender );

	page( '/backups', siteSelection, setupSidebar, makeLayout, clientRender );
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
		'/backups/:site/download/:downloadId',
		siteSelection,
		setupSidebar,
		backupDownload,
		makeLayout,
		clientRender
	);
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

	page( '/scan', siteSelection, setupSidebar, makeLayout, clientRender );
	page( '/scan/:site', siteSelection, setupSidebar, scan, makeLayout, clientRender );
	page( '/scan/:site/history', siteSelection, setupSidebar, scanHistory, makeLayout, clientRender );

	page( '/settings', siteSelection, setupSidebar, makeLayout, clientRender );
	page( '/settings/:site', siteSelection, setupSidebar, settings, makeLayout, clientRender );
};

export default router;
