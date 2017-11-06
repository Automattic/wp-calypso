/**
 * External dependencies
 *
 * @format
 */

import debugFactory from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_BACKUP } from 'state/action-types';
import { rewindBackupUpdateError, getRewindBackupProgress } from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const debug = debugFactory( 'calypso:data-layer:activity-log:rewind:to' );

const fromApi = data => ( {
	downloadId: +data.downloadId,
} );

const createBackup = ( { dispatch }, action ) => {
	console.warn( 'action', action );
	dispatch(
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
		)
	);
};

export const receiveBackupSuccess = ( { dispatch }, { siteId }, apiData ) => {
	const { downloadId } = fromApi( apiData );
	if ( downloadId ) {
		debug( 'Request restore success, restore id:', downloadId );
		console.warn( 'getRewindBackupProgress', siteId, downloadId );
		dispatch( getRewindBackupProgress( siteId, downloadId ) );
	} else {
		debug( 'Request restore response missing restore_id' );
		console.warn( 'rewindBackupUpdateError', siteId );
		dispatch(
			rewindBackupUpdateError( siteId, {
				status: 'finished',
				error: 'missing_download_id',
				message: 'Bad response. No download ID provided.',
			} )
		);
	}
};

export const receiveBackupError = ( { dispatch }, { siteId, timestamp }, error ) => {
	debug( 'Request restore fail', error );
	console.log( 'receiveBackupError', siteId, timestamp );
	dispatch( rewindBackupUpdateError( siteId, pick( error, [ 'error', 'status', 'message' ] ) ) );
};

export default {
	[ REWIND_BACKUP ]: [ dispatchRequest( createBackup, receiveBackupSuccess, receiveBackupError ) ],
};
