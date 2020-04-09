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
	backupActivity,
	backupDetail,
	backupDownload,
	backupRestore,
	wrapInSiteOffsetProvider,
} from 'landing/jetpack-cloud/sections/backups/controller';
import {
	backupMainPath,
	backupActivityPath,
	backupRestorePath,
	backupDownloadPath,
	backupDetailPath,
} from './paths';

export default function() {
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
		/* handles /backups/:site, see `backupMainPath` */
		page(
			backupMainPath( ':site' ),
			siteSelection,
			navigation,
			backups,
			wrapInSiteOffsetProvider,
			makeLayout,
			clientRender
		);
		/* handles /backups, see `backupMainPath` */
		page( backupMainPath(), siteSelection, sites, makeLayout, clientRender );
	}
}
