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
	const backupId = parseInt( context.params.backupId );

	context.primary = <BackupDetailPage backupId={ backupId } />;
	next();
}

export function backups( context, next ) {
	context.primary = <BackupsPage />;
	next();
}

export function backupRestore( context, next ) {
	const restoreId = parseInt( context.params.restoreId );

	context.primary = <BackupRestorePage restoreId={ context.params.restoreId ? restoreId : null } />;
	next();
}

export function backupDownload( context, next ) {
	const downloadId = parseInt( context.params.downloadId );

	context.primary = <BackupDownloadPage downloadId={ downloadId } />;
	next();
}
