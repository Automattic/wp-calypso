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
import wrapInSiteOffsetProvider from 'landing/jetpack-cloud/lib/wrap-in-site-offset';
import {
	backupActivity,
	backupDetail,
	backupDownload,
	backupRestore,
	backupsStatus,
	showUpsellIfNoBackup,
} from 'landing/jetpack-cloud/sections/backups/controller';
import {
	backupActivityPath,
	backupDetailPath,
	backupDownloadPath,
	backupRestorePath,
	backupsStatusPath,
} from './paths';

export default function () {
	if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
		/* handles /backups/activity, see `backupActivityPath` */
		page( backupActivityPath(), siteSelection, sites, makeLayout, clientRender );

		/* handles /backups/activity/:site, see `backupActivityPath` */
		page(
			backupActivityPath( ':site' ),
			siteSelection,
			navigation,
			backupActivity,
			wrapInSiteOffsetProvider,
			showUpsellIfNoBackup,
			makeLayout,
			clientRender
		);

		/* handles /backups/:site/detail/:backupId, see `backupDetailPath` */
		page(
			backupDetailPath( ':site', ':backupId' ),
			siteSelection,
			navigation,
			backupDetail,
			wrapInSiteOffsetProvider,
			makeLayout,
			clientRender
		);
		/* handles /backups/:site/download/:rewindId, see `backupDownloadPath` */
		page(
			backupDownloadPath( ':site', ':rewindId' ),
			siteSelection,
			navigation,
			backupDownload,
			wrapInSiteOffsetProvider,
			makeLayout,
			clientRender
		);

		if ( config.isEnabled( 'jetpack-cloud/backups-restore' ) ) {
			/* handles /backups/:site/restore/:rewindId, see `backupRestorePath` */
			page(
				backupRestorePath( ':site', ':rewindId' ),
				siteSelection,
				navigation,
				backupRestore,
				wrapInSiteOffsetProvider,
				makeLayout,
				clientRender
			);
		}
		/* handles /backups/:site, see `backupsStatusPath` */
		page(
			backupsStatusPath( ':site' ),
			siteSelection,
			navigation,
			backupsStatus,
			wrapInSiteOffsetProvider,
			showUpsellIfNoBackup,
			makeLayout,
			clientRender
		);
		/* handles /backups, see `backupsStatusPath` */
		page( backupsStatusPath(), siteSelection, sites, makeLayout, clientRender );
	}
}
