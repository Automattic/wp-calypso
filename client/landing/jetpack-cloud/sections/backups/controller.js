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
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.RESTORE } />
	);
	next();
}

export function backupDownload( context, next ) {
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.DOWNLOAD } />
	);
	next();
}
