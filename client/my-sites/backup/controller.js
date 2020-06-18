/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackupRewindFlow, { RewindFlowPurpose } from './rewind-flow';
import BackupsPage from './main';
import UpsellSwitch from 'components/jetpack/upsell-switch';
import BackupUpsell from './backup-upsell';
import WPCOMBackupUpsell from './wpcom-backup-upsell';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';

export function showUpsellIfNoBackup( context, next ) {
	const UpsellComponent = isJetpackCloud() ? BackupUpsell : WPCOMBackupUpsell;
	context.primary = (
		<UpsellSwitch
			UpsellComponent={ UpsellComponent }
			display={ context.primary }
			getStateForSite={ getRewindState }
			QueryComponent={ QueryRewindState }
		/>
	);
	next();
}

/* handles /backup/:site, see `backupMainPath` */
export function backups( context, next ) {
	const { date } = context.query;

	context.primary = <BackupsPage queryDate={ date } />;
	next();
}

/* handles /backup/:site/download/:rewindId, see `backupDownloadPath` */
export function backupDownload( context, next ) {
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.DOWNLOAD } />
	);
	next();
}

/* handles /backup/:site/restore/:rewindId, see `backupRestorePath` */
export function backupRestore( context, next ) {
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.RESTORE } />
	);
	next();
}
