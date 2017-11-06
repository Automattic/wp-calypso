/**
 * External dependencies
 *
 * @format
 */

import debugFactory from 'debug';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { createNotice } from 'state/notices/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { REWIND_BACKUP_PROGRESS_REQUEST } from 'state/action-types';
import { updateRewindBackupProgress } from 'state/activity-log/actions';

const debug = debugFactory( 'calypso:data-layer:activity-log:rewind:backup-status' );

const requestBackupProgress = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				apiVersion: '1',
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ action.siteId }/rewind/downloads/${ action.downloadId }`,
				body: {
					downloadId: action.downloadId,
				},
			},
			action
		)
	);
};

const fromApi = ( { backup_status = {} } ) => {
	const {
		backupPoint = '',
		downloadId = 0,
		progress = 0,
		rewindId = 0,
		startedAt = '',
	} = backup_status;

	return {
		backupPoint: backupPoint,
		downloadId: downloadId,
		progress: progress,
		rewindId: rewindId,
		startedAt: startedAt,
	};
};

export const receiveBackupProgress = ( { dispatch }, { siteId, downloadId }, apiData ) => {
	const data = fromApi( apiData );

	debug( 'Backup progress', data );
	console.warn( 'Backup progress', data );

	dispatch( updateRewindBackupProgress( siteId, downloadId, data ) );
};

// FIXME: Could be a network Error (instanceof Error) or an API error. Handle each case correctly.
export const receiveBackupError = ( { dispatch }, action, error ) => {
	debug( 'Backup progress error', error );
	console.warn( 'Backup progress error', error );

	dispatch(
		createNotice(
			'is-warning',
			translate( "Hmm, we can't update the status of your backup. Please refresh this page." )
		)
	);
};

export default {
	[ REWIND_BACKUP_PROGRESS_REQUEST ]: [
		dispatchRequest( requestBackupProgress, receiveBackupProgress, receiveBackupError ),
	],
};
