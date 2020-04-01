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
import {
	backupMainPath,
	backupsRestorePath,
	backupsDownloadPath,
	backupsDetailPath,
} from './paths';

export default function() {
	if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
		page(
			backupsDetailPath( ':site', ':backupId' ),
			siteSelection,
			navigation,
			backupDetail,
			makeLayout,
			clientRender
		);
		page(
			backupsDownloadPath( ':site', ':rewindId' ),
			siteSelection,
			navigation,
			backupDownload,
			makeLayout,
			clientRender
		);

		if ( config.isEnabled( 'jetpack-cloud/backups-restore' ) ) {
			page(
				backupsRestorePath( ':site', ':rewindId' ),
				siteSelection,
				navigation,
				backupRestore,
				makeLayout,
				clientRender
			);
		}

		page( backupMainPath( ':site' ), siteSelection, navigation, backups, makeLayout, clientRender );
		page( backupMainPath(), siteSelection, sites, makeLayout, clientRender );
	}
}
