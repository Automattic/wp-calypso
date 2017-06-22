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
import { exponentialBackoff } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { http } from 'state/data-layer/wpcom-http/actions';

const debug = debugFactory( 'calypso:data-layer:activity-log:rewind:restore-status' );

const requestRestoreProgress = ( { dispatch }, action ) => {
	dispatch( http( {
		apiVersion: '1',
		method: 'GET',
		path: `/activity-log/${ action.siteId }/rewind/${ action.restoreId }/restore-status`,
		retryPolicy: exponentialBackoff(),
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

export const receiveRestoreProgress = ( { dispatch }, { siteId, restoreId }, next, apiData ) => {
	const POLLING_DELAY_MS = 1500;

	const data = fromApi( apiData );

	debug( 'Restore progress', data );

	dispatch( updateRewindRestoreProgress( siteId, data ) );
	if ( data.status !== 'finished' ) {
		delay( dispatch, POLLING_DELAY_MS, getRewindRestoreProgress( siteId, restoreId ) );
	}
};

// FIXME: This could be a network error or an API error. Handle each case correctly.
export const receiveRestoreError = ( { dispatch }, { siteId }, next, error ) => {
	debug( 'Restore progress error', error );

	dispatch( rewindRestoreUpdateError(
		siteId,
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
