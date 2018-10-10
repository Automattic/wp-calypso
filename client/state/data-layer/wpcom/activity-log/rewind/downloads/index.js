/** @format */

/**
 * External dependencies
 */

import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_BACKUP } from 'state/action-types';
import { rewindBackupUpdateError, getRewindBackupProgress } from 'state/activity-log/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const createBackup = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/rewind/downloads`,
			body: {
				rewindId: action.rewindId,
			},
		},
		action
	);

const fromApi = data => {
	if ( ! data.hasOwnProperty( 'downloadId' ) ) {
		throw new Error( 'Missing downloadId field in response' );
	}

	return true;
};

export const receiveBackupSuccess = ( { siteId } ) => getRewindBackupProgress( siteId );

export const receiveBackupError = ( { siteId }, error ) =>
	rewindBackupUpdateError( siteId, pick( error, [ 'error', 'status', 'message' ] ) );

registerHandlers( 'state/data-layer/wpcom/activity-log/rewind/downloads/index.js', {
	[ REWIND_BACKUP ]: [
		dispatchRequestEx( {
			fetch: createBackup,
			onSuccess: receiveBackupSuccess,
			onError: receiveBackupError,
			fromApi,
		} ),
	],
} );
