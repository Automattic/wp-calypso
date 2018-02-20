/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { REWIND_STATE_REQUEST, REWIND_STATE_UPDATE } from 'state/action-types';
import { activityLogRequest } from 'state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx, makeParser } from 'state/data-layer/wpcom-http/utils';
import { getActivityLogs } from 'state/selectors';
import { transformApi } from './api-transformer';
import { rewindStatus } from './schema';

import downloads from './downloads';

const getType = o => ( o && o.constructor && o.constructor.name ) || typeof o;

const fetchRewindState = action =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

/**
 * Re-requests the activity log entries for all
 * previously-sent queries in application state
 *
 * @param {Number} siteId the site being queried
 * @param {Object} rewind Rewind state for the site
 * @returns {function} thunk action maybe dispatching requests
 */
const refreshActivityLogAfterRewind = ( siteId, rewind ) => ( dispatch, getState ) => {
	if ( ! rewind || rewind.status === 'running' ) {
		return;
	}

	const state = getState();
	const prev = state.rewind[ siteId ];

	if ( ! prev || ! ( prev.rewind && prev.rewind.status === 'running' ) ) {
		return;
	}

	const logItems = state.activityLog.logItems[ siteId ];
	if ( ! logItems ) {
		return;
	}

	const events = getActivityLogs( state, siteId );
	const dateStart = events.reduce(
		( oldest, { activityTs: ts } ) => Math.min( oldest, ts ),
		Infinity
	);

	const query = {
		dateStart,
		dateEnd: Date.now(),
		number: 1000,
	};

	// queue an update to them as well to grab more authoritative
	// data just wait because it takes much longer on the server
	// for all of the changes to propagate back
	setTimeout( () => dispatch( activityLogRequest( siteId, query ) ), 15000 );
};

const updateRewindState = ( { siteId }, data ) => {
	const stateUpdate = {
		type: REWIND_STATE_UPDATE,
		siteId,
		data,
	};

	const hasRunningRewind =
		data.rewind && ( data.rewind.status === 'queued' || data.rewind.status === 'running' );

	if ( ! hasRunningRewind ) {
		return [
			/*
			 * When we finish a Rewind operation we may have
			 * changed the `isDiscarded` value for previous
			 * events in the Activity Log. Thus, we'll need to
			 * reissue the requests which pulled all of the
			 * previous events into Calypso.
			 *
			 * This _must_ go before the state update because
			 * it relies on existing state to know if we have
			 * transitioned from a time when we had a Rewind
			 * operation running to a time when we no longer
			 * have that.
			 *
			 * If we wait until after state is updated then it
			 * will never look like we had on.
			 */
			refreshActivityLogAfterRewind( siteId, data.rewind ),
			stateUpdate,
		];
	}

	const delayedStateRequest = dispatch =>
		setTimeout(
			() =>
				dispatch( {
					type: REWIND_STATE_REQUEST,
					siteId,
				} ),
			3000
		);

	return [ stateUpdate, delayedStateRequest ];
};

const setUnknownState = ( { siteId }, error ) => {
	const httpStatus = error.hasOwnProperty( 'status' ) ? parseInt( error.status, 10 ) : null;

	// these are indicative of a network request
	if (
		error.hasOwnProperty( 'code' ) &&
		error.hasOwnProperty( 'message' ) &&
		httpStatus &&
		httpStatus >= 400 // bad HTTP responses, could be 4xx or 5xx
	) {
		return withAnalytics(
			recordTracksEvent( 'calypso_rewind_state_bad_response', {
				code: error.code,
				message: error.message,
				status: error.status,
			} ),
			{
				type: REWIND_STATE_UPDATE,
				siteId,
				data: {
					state: 'unavailable',
					reason: 'unknown',
					lastUpdated: new Date(),
				},
			}
		);
	}

	return withAnalytics(
		recordTracksEvent( 'calypso_rewind_state_parse_error', {
			type: getType( error ),
			error: JSON.stringify( error ),
		} ),
		{
			type: REWIND_STATE_UPDATE,
			siteId,
			data: {
				state: 'unknown',
				lastUpdated: new Date(),
			},
		}
	);
};

export default mergeHandlers( downloads, {
	[ REWIND_STATE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchRewindState,
			onSuccess: updateRewindState,
			onError: setUnknownState,
			fromApi: makeParser( rewindStatus, {}, transformApi ),
		} ),
	],
} );
