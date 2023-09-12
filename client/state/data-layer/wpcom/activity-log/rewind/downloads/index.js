import { pick } from 'lodash';
import { REWIND_BACKUP, REWIND_GRANULAR_BACKUP_REQUEST } from 'calypso/state/action-types';
import {
	rewindBackupUpdateError,
	updateRewindBackupProgress,
	getRewindBackupProgress,
	setRewindBackupDownloadId,
} from 'calypso/state/activity-log/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const createBackup = ( action ) =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/rewind/downloads`,
			body: {
				rewindId: action.rewindId,
				types: action.args,
			},
		},
		action
	);

const createGranularBackup = ( action ) => {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/rewind/downloads`,
			body: {
				rewindId: action.rewindId,
				types: { paths: true },
				include_path_list: action.includePaths,
				exclude_path_list: action.excludePaths,
			},
		},
		action
	);
};

const fromApi = ( data ) => {
	if ( ! data.hasOwnProperty( 'downloadId' ) ) {
		throw new Error( 'Missing downloadId field in response' );
	}

	return data;
};

export const receiveBackupSuccess = ( { siteId }, data ) => {
	return [
		getRewindBackupProgress( siteId ),
		setRewindBackupDownloadId( siteId, data.downloadId ),
		updateRewindBackupProgress( siteId, data.downloadId, data ),
	];
};

export const receiveBackupError = ( { siteId }, error ) =>
	rewindBackupUpdateError( siteId, pick( error, [ 'error', 'status', 'message' ] ) );

registerHandlers( 'state/data-layer/wpcom/activity-log/rewind/downloads/index.js', {
	[ REWIND_BACKUP ]: [
		dispatchRequest( {
			fetch: createBackup,
			onSuccess: receiveBackupSuccess,
			onError: receiveBackupError,
			fromApi,
		} ),
	],
	[ REWIND_GRANULAR_BACKUP_REQUEST ]: [
		dispatchRequest( {
			fetch: createGranularBackup,
			onSuccess: receiveBackupSuccess,
			onError: receiveBackupError,
			fromApi,
		} ),
	],
} );
