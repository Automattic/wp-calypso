/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackupActivityLogPage from './backup-activity-log';
import BackupDetailPage from './detail';
import BackupRewindFlow, { RewindFlowPurpose } from './rewind-flow';
import BackupsPage from './main';
import UpsellSwitch from 'landing/jetpack-cloud/components/upsell-switch';
import BackupsUpsell from './backup-upsell';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';

export function showUpsellIfNoBackup( context, next ) {
	context.primary = (
		<UpsellSwitch
			UpsellComponent={ BackupsUpsell }
			display={ context.primary }
			getStateForSite={ getRewindState }
			QueryComponent={ QueryRewindState }
		/>
	);
	next();
}

/* handles /backups/:site, see `backupMainPath` */
export function backups( context, next ) {
	const { date } = context.query;

	context.primary = <BackupsPage queryDate={ date } />;
	next();
}

/* handles /backups/activity/:site, see `backupActivityPath` */
export function backupActivity( context, next ) {
	context.primary = (
		<BackupActivityLogPage
			after={ context.query.after }
			before={ context.query.before }
			group={ context.query.group }
			page={ context.query.page }
		/>
	);
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
