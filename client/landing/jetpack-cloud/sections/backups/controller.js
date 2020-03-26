/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackupDetailPage from './detail';
import BackupsPage from './main';
import BackupRewindFlow, { RewindFlowPurpose } from './rewind-flow';
import BackupActivityLog from './activity-log';

/* handles /backups/:site, see `backupMainPath` */
export function backups( context, next ) {
	context.primary = <BackupsPage />;
	next();
}

/* handles /backups/:site/detail/:backupId, see `backupDetailPath` */
export function backupDetail( context, next ) {
	const backupId = context.params.backupId;

	context.primary = <BackupDetailPage backupId={ backupId } />;
	next();
}

/* handles /backups/:site/download/:rewindId, see `backupDownloadPath` */
export function backupDownload( context, next ) {
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.DOWNLOAD } />
	);
	next();
}

/* handles /backups/:site/restore/:rewindId, see `backupRestorePath` */
export function backupRestore( context, next ) {
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.RESTORE } />
	);
	next();
}

export function backupActivityLog( context, next ) {
	context.primary = <BackupActivityLog />;
	next();
}
