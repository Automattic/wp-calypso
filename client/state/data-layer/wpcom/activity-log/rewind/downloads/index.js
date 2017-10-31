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
// import { rewindRestoreUpdateError, getRewindRestoreProgress } from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const debug = debugFactory( 'calypso:data-layer:activity-log:rewind:to' );

const fromApi = data => ( {
	downloadId: +data.downloadId,
} );

const createBackup = ( { dispatch }, action ) => {
	console.log( 'action', action );
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

export const receiveRestoreSuccess = ( { dispatch }, { siteId, timestamp }, apiData ) => {
	const { downloadId } = fromApi( apiData );
	if ( downloadId ) {
		debug( 'Request restore success, restore id:', downloadId );
		console.log( siteId, timestamp, downloadId );
		// dispatch( getRewindRestoreProgress( siteId, timestamp, downloadId ) );
	} else {
		debug( 'Request restore response missing restore_id' );
		console.log( siteId, timestamp );
		// dispatch(
		// 	rewindRestoreUpdateError( siteId, timestamp, {
		// 		status: 'finished',
		// 		error: 'missing_restore_id',
		// 		message: 'Bad response. No restore ID provided.',
		// 	} )
		// );
	}
};

export const receiveRestoreError = ( { dispatch }, { siteId, timestamp }, error ) => {
	debug( 'Request restore fail', error );
	console.log( siteId, timestamp );
	// dispatch(
	// 	rewindRestoreUpdateError( siteId, timestamp, pick( error, [ 'error', 'status', 'message' ] ) )
	// );
};

export default {
	[ REWIND_BACKUP ]: [
		dispatchRequest( createBackup, receiveRestoreSuccess, receiveRestoreError ),
	],
};
