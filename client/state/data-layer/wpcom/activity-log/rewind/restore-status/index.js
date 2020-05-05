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

import { registerHandlers } from 'state/data-layer/handler-registry';

/** @type {number} how many ms between polls for same data */
const POLL_INTERVAL = 1500;

/** @type {Map<string, number>} stores most-recent polling times */
const recentRequests = new Map();

/** @type {string} Request error notice id. Prevents polling from creating endless notices */
const ERROR_NOTICE_ID = 'AL_REW_RESTORESTATUS_ERR';

/**
 * Fetch status updates for restore operations
 *
 * Note! Eventually the manual "caching" here should be
 * replaced by the `freshness` system in the data layer
 * when it arrives. For now, it's statefully ugly.
 *
 * @param  {object} action Redux action
 * @returns {object}        Redux action
 */
const fetchProgress = ( action ) => {
	const { restoreId, siteId } = action;
	const key = `${ siteId }-${ restoreId }`;

	const lastUpdate = recentRequests.get( key ) || -Infinity;
	const now = Date.now();

	if ( now - lastUpdate < POLL_INTERVAL ) {
		return;
	}

	recentRequests.set( key, now );

	return http(
		{
			apiVersion: '1',
			method: 'GET',
			path: `/activity-log/${ siteId }/rewind/${ restoreId }/restore-status`,
		},
		action
	);
};

export const fromApi = ( {
	restore_status: {
		error_code = '',
		failure_reason = '',
		message = '',
		percent = 0,
		status = '',
		rewind_id = '',
		context = '',
	} = {},
} ) => ( {
	errorCode: error_code,
	failureReason: failure_reason,
	message,
	percent: +percent,
	status,
	rewindId: rewind_id,
	context,
} );

export const updateProgress = ( { siteId, restoreId, timestamp }, data ) =>
	updateRewindRestoreProgress( siteId, timestamp, restoreId, data );

export const announceFailure = () =>
	errorNotice(
		translate( "Hmm, we can't update the status of your restore. Please refresh this page." ),
		{ id: ERROR_NOTICE_ID }
	);

registerHandlers( 'state/data-layer/wpcom/activity-log/rewind/restore-status/index.js', {
	[ REWIND_RESTORE_PROGRESS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchProgress,
			onSuccess: updateProgress,
			onError: announceFailure,
			fromApi,
		} ),
	],
} );
