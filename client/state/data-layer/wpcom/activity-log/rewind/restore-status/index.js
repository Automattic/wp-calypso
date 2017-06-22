/**
 * External dependencies
 */
import debugFactory from 'debug';
import { pick, delay } from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_RESTORE_PROGRESS_REQUEST,
} from 'state/action-types';
import {
	getRewindRestoreProgress,
	updateRewindRestoreProgress,
	rewindRestoreUpdateError
} from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const debug = debugFactory( 'calypso:data-layer:activity-log:rewind:restore-status' );

const requestRestoreProgress = ( { dispatch }, action ) => {
	dispatch( http( {
		apiVersion: '1',
		method: 'GET',
		path: `/activity-log/${ action.siteId }/rewind/${ action.restoreId }/restore-status`,
	}, action ) );
};

const fromApi = ( { restore_status = {} } ) => {
	const {
		error_code = '',
		failure_reason = '',
		message = '',
		percent = 0,
		status = '',
	} = restore_status;

	return {
		errorCode: error_code,
		failureReason: failure_reason,
		message,
		percent: +percent,
		status,
	};
};

export const receiveRestoreProgress = ( { dispatch }, { siteId, timestamp, restoreId }, next, apiData ) => {
	const POLLING_DELAY_MS = 1500;

	const data = fromApi( apiData );

	debug( 'Restore progress', data );

	dispatch( updateRewindRestoreProgress( siteId, timestamp, restoreId, data ) );
	if ( data.status !== 'finished' ) {
		delay( dispatch, POLLING_DELAY_MS, getRewindRestoreProgress( siteId, timestamp, restoreId ) );
	}
};

// FIXME: Could be a network Error (instanceof Error) or an API error. Handle each case correctly.
export const receiveRestoreError = ( { dispatch }, { siteId, timestamp, restoreId }, next, error ) => {
	debug( 'Restore progress error', error );

	dispatch( rewindRestoreUpdateError(
		siteId,
		timestamp,
		restoreId,
		pick( error, [ 'error', 'status', 'message' ] )
	) );
};

export default {
	[ REWIND_RESTORE_PROGRESS_REQUEST ]: [ dispatchRequest(
		requestRestoreProgress,
		receiveRestoreProgress,
		receiveRestoreError
	) ],
};
