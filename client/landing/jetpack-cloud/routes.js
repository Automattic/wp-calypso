/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { normalize } from 'lib/route';
import { siteSelection } from 'my-sites/controller';
import { clientRender, makeLayout, setupSidebar } from './controller';
import { jetpackCloudDashboard } from './sections/dashboard/controller';
import { jetpackCloudBackups } from './sections/backups/controller';
import { jetpackCloudBackupDetail } from './sections/backup-detail/controller';
import { jetpackCloudBackupDownload } from './sections/backup-download/controller';
import { jetpackCloudBackupRestore } from './sections/backup-restore/controller';
import { jetpackCloudScan } from './sections/scan/controller';
import { jetpackCloudScanHistory } from './sections/scan-history/controller';
import { jetpackCloudSettings } from './sections/settings/controller';

const router = () => {
	page( '*', normalize );

	page( '/', setupSidebar, jetpackCloudDashboard, makeLayout, clientRender );

	page( '/backups', siteSelection, setupSidebar, jetpackCloudBackups, makeLayout, clientRender );
	page( '/backups/:site', siteSelection, setupSidebar, jetpackCloudBackups, makeLayout, clientRender );
	page( '/backups/:site/detail/:backupId', siteSelection, setupSidebar, jetpackCloudBackupDetail, makeLayout, clientRender );
	page( '/backups/:site/download/:downloadId', siteSelection, setupSidebar, jetpackCloudBackupDownload, makeLayout, clientRender );
	page( '/backups/:site/restore', siteSelection, setupSidebar, jetpackCloudBackupRestore, makeLayout, clientRender )
	page( '/backups/:site/restore/:restoreId', siteSelection, setupSidebar, jetpackCloudBackupRestore, makeLayout, clientRender );

	page( '/scan', siteSelection, setupSidebar, jetpackCloudScan, makeLayout, clientRender );
	page( '/scan/:site', siteSelection, setupSidebar, jetpackCloudScan, makeLayout, clientRender );
	page( '/scan/:site/history', siteSelection, setupSidebar, jetpackCloudScanHistory, makeLayout, clientRender );

	page( '/settings', siteSelection, setupSidebar, jetpackCloudSettings, makeLayout, clientRender );
	page( '/settings/:site', siteSelection, setupSidebar, jetpackCloudSettings, makeLayout, clientRender );
};

export default router;
