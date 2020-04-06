/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { SiteOffsetProvider } from 'landing/jetpack-cloud/components/site-offset/context';
import BackupDetailPage from './detail';
import BackupRewindFlow, { RewindFlowPurpose } from './rewind-flow';
import BackupsPage from './main';
import BackupActivityLogPage from './backup-activity-log';

export function wrapInSiteOffsetProvider( context, next ) {
	context.primary = (
		<SiteOffsetProvider site={ context.params.site }>{ context.primary }</SiteOffsetProvider>
	);
	next();
}

/* handles /backups/:site, see `backupMainPath` */
export function backups( context, next ) {
	context.primary = <BackupsPage />;
	next();
}

/* handles /backups/activity/:site, see `backupsActivityPath` */
export function backupActivity( context, next ) {
	context.primary = <BackupActivityLogPage />;
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
