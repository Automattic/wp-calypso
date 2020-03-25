/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackupDetailPage from './detail';
import BackupDownloadPage from './download';
import BackupsPage from './main';
import BackupRestorePage from './restore';

export function backupDetail( context, next ) {
	const backupId = context.params.backupId;

	context.primary = <BackupDetailPage backupId={ backupId } />;
	next();
}

export function backups( context, next ) {
	context.primary = <BackupsPage />;
	next();
}

export function backupRestore( context, next ) {
	const restoreId = context.params.restoreId;

	context.primary = <BackupRestorePage restoreId={ context.params.restoreId ? restoreId : null } />;
	next();
}

export function backupDownload( context, next ) {
	context.primary = <BackupDownloadPage rewindId={ context.params.rewindId } />;
	next();
}
