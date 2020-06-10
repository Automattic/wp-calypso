/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackupActivityLogPage from './backup-activity-log';
import BackupRewindFlow, { RewindFlowPurpose } from './rewind-flow';
import BackupsPage from './main';
import UpsellSwitch from 'components/jetpack/upsell-switch';
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

/* handles /backup/:site, see `backupMainPath` */
export function backups( context, next ) {
	const { date } = context.query;

	context.primary = <BackupsPage queryDate={ date } />;
	next();
}

/* handles /backup/activity/:site, see `backupActivityPath` */
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
