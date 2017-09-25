/**
 * External dependencies
 */
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { REWIND_RESTORE_PROGRESS_REQUEST } from 'state/action-types';
import { updateRewindRestoreProgress } from 'state/activity-log/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { createNotice } from 'state/notices/actions';

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

export const receiveRestoreProgress = ( { dispatch }, { siteId, timestamp, restoreId }, apiData ) => {
	const data = fromApi( apiData );

	debug( 'Restore progress', data );

	dispatch( updateRewindRestoreProgress( siteId, timestamp, restoreId, data ) );
};

// FIXME: Could be a network Error (instanceof Error) or an API error. Handle each case correctly.
export const receiveRestoreError = ( { dispatch }, action, error ) => {
	debug( 'Restore progress error', error );

	dispatch( createNotice(
		'is-warning',
		translate( "Hmm, we can't update the status of your restore. Please refresh this page." ),
	) );
};

export default {
	[ REWIND_RESTORE_PROGRESS_REQUEST ]: [ dispatchRequest(
		requestRestoreProgress,
		receiveRestoreProgress,
		receiveRestoreError
	) ],
};
