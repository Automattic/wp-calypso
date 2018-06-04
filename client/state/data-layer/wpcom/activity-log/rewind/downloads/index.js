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

export default {
	[ REWIND_BACKUP ]: [
		dispatchRequestEx( {
			fetch: createBackup,
			onSuccess: receiveBackupSuccess,
			onError: receiveBackupError,
			fromApi,
		} ),
	],
};
