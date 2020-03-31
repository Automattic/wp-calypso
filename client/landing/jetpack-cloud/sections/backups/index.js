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
import { backupsMain, backupsRestore, backupsDownload, backupsDetail } from './paths';

export default function() {
	if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
		page( backupsMain(), siteSelection, sites, makeLayout, clientRender );
		page( backupsMain( ':site' ), siteSelection, navigation, backups, makeLayout, clientRender );
		page(
			backupsDetail( ':site', ':backupId' ),
			siteSelection,
			navigation,
			backupDetail,
			makeLayout,
			clientRender
		);
		page(
			backupsDownload( ':site', ':rewindId' ),
			siteSelection,
			navigation,
			backupDownload,
			makeLayout,
			clientRender
		);

		if ( config.isEnabled( 'jetpack-cloud/backups-restore' ) ) {
			page(
				backupsRestore( ':site', ':rewindId' ),
				siteSelection,
				navigation,
				backupRestore,
				makeLayout,
				clientRender
			);
		}
	}
}
