/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { errorNotice } from 'state/notices/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { REWIND_RESTORE_PROGRESS_REQUEST } from 'state/action-types';
import { updateRewindRestoreProgress } from 'state/activity-log/actions';

/** @type {Number} how many ms between polls for same data */
const POLL_INTERVAL = 1500;

/** @type {Map<String, Number>} stores most-recent polling times */
const recentRequests = new Map();

/**
 * Fetch status updates for restore operations
 *
 * Note! Eventually the manual "caching" here should be
 * replaced by the `freshness` system in the data layer
 * when it arrives. For now, it's statefully ugly.
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
const fetchProgress = ( { dispatch }, action ) => {
	const { restoreId, siteId } = action;
	const key = `${ siteId }-${ restoreId }`;

	const lastUpdate = recentRequests.get( key ) || -Infinity;
	const now = Date.now();

	if ( now - lastUpdate < POLL_INTERVAL ) {
		return;
	}

	recentRequests.set( key, now );

	dispatch(
		http(
			{
				apiVersion: '1',
				method: 'GET',
				path: `/activity-log/${ siteId }/rewind/${ restoreId }/restore-status`,
			},
			action
		)
	);
};

export const fromApi = ( {
	restore_status: {
		error_code = '',
		failure_reason = '',
		message = '',
		percent = 0,
		status = '',
	} = {},
} ) => ( {
	errorCode: error_code,
	failureReason: failure_reason,
	message,
	percent: +percent,
	status,
} );

export const updateProgress = ( { dispatch }, { siteId, restoreId, timestamp }, data ) =>
	dispatch( updateRewindRestoreProgress( siteId, timestamp, restoreId, data ) );

export const announceFailure = ( { dispatch } ) =>
	dispatch(
		errorNotice(
			translate( "Hmm, we can't update the status of your restore. Please refresh this page." )
		)
	);

export default {
	[ REWIND_RESTORE_PROGRESS_REQUEST ]: [
		dispatchRequest( fetchProgress, updateProgress, announceFailure, { fromApi } ),
	],
};
