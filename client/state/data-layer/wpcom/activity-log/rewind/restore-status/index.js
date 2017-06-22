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

const fromApi = data => {
	return {
		status: data.status,
		percent: data.percent,
		message: data.message,
		errorCode: data.error_code,
		failureReason: data.failure_reason,
	};
};

export const receiveRestoreProgress = ( { dispatch }, { siteId, timestamp }, next, data ) => {
	const POLLING_DELAY_MS = 1500;

	const data = fromApi( apiData );

	debug( 'Restore progress', data );

	dispatch( updateRewindRestoreProgress( siteId, data ) );
	if ( data.status !== 'finished' ) {
		delay( dispatch, POLLING_DELAY_MS, getRewindRestoreProgress( siteId, timestamp ) );
	}
};

export const receiveRestoreError = ( { dispatch }, { siteId, timestamp }, next, error ) => {
	debug( 'Restore progress error', error );

	dispatch( rewindRestoreUpdateError(
		siteId,
		timestamp,
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
