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
import {
	backups,
	backupDetail,
	backupDownload,
	backupRestore,
} from 'landing/jetpack-cloud/sections/backups/controller';
import { backupMainPath, backupRestorePath, backupDownloadPath, backupDetailPath } from './paths';

export default function() {
	if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
		/* handles /backups/:site/detail/:backupId, see `backupDetailPath` */
		page(
			backupDetailPath( ':site', ':backupId' ),
			siteSelection,
			navigation,
			backupDetail,
			makeLayout,
			clientRender
		);
		/* handles /backups/:site/download/:rewindId, see `backupDownloadPath` */
		page(
			backupDownloadPath( ':site', ':rewindId' ),
			siteSelection,
			navigation,
			backupDownload,
			makeLayout,
			clientRender
		);

		if ( config.isEnabled( 'jetpack-cloud/backups-restore' ) ) {
			/* handles /backups/:site/restore/:restoreId, see `backupRestorePath` */
			page(
				backupRestorePath( ':site', ':rewindId' ),
				siteSelection,
				navigation,
				backupRestore,
				makeLayout,
				clientRender
			);
		}
		/* handles /backups/:site, see `backupMainPath` */
		page( backupMainPath( ':site' ), siteSelection, navigation, backups, makeLayout, clientRender );
		/* handles /backups, see `backupMainPath` */
		page( backupMainPath(), siteSelection, sites, makeLayout, clientRender );
	}
}
