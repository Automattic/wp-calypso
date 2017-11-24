/** @format */
/**
 * External dependencies
 */
import { get, merge, omitBy } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import fromApi from './from-api';
import { ACTIVITY_LOG_REQUEST, ACTIVITY_LOG_WATCH } from 'state/action-types';
import { activityLogRequest, activityLogUpdate } from 'state/activity-log/actions';
import { dispatchRequestEx, getData, getError } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteGmtOffset } from 'state/selectors';

const POLL_INTERVAL = 10000;
const pollingSites = new Map();

export const togglePolling = ( { dispatch, getState }, { isWatching, siteId } ) => {
	if ( isWatching ) {
		const newestDate = Date.now();
		pollingSites.set( siteId, { newestDate } );

		// kick off the first polling
		dispatch(
			merge(
				activityLogRequest( siteId, {
					dateStart: newestDate - getSiteGmtOffset( getState(), siteId ) * 3600 * 1000,
					number: 100,
				} ),
				{
					meta: {
						dataLayer: {
							isWatching: true,
						},
					},
				}
			)
		);
	} else {
		pollingSites.delete( siteId );
	}
};

export const continuePolling = ( { dispatch }, action ) => {
	if ( ! get( action, 'meta.dataLayer.isWatching' ) ) {
		return;
	}

	const { siteId } = action;

	const error = getError( action );
	if ( undefined !== error ) {
		pollingSites.delete( siteId );

		dispatch( recordTracksEvent( 'calypso_activity_log_polling_fail', { siteId } ) );
		return;
	}

	const rawData = getData( action );
	if ( undefined !== rawData ) {
		const prevState = pollingSites.get( siteId );

		if ( ! prevState ) {
			return;
		}

		const data = fromApi( rawData ).items;

		const newestDate = data.reduce(
			( newest, { activityTs } ) => Math.max( newest, activityTs ),
			prevState.newestDate
		);

		// no need to send out a new request if we're waiting on one
		if ( prevState.timer ) {
			pollingSites.set( siteId, { ...prevState, newestDate } );
			return;
		}

		const timer = setTimeout( () => {
			// Since we update the list of sites with pollingSites.set()
			// We need to check to make sure that the site was not removed.
			// Otherwise this causes a bug where we poll the site forever.
			if ( ! pollingSites.get( siteId ) ) {
				return;
			}
			pollingSites.set( siteId, { ...pollingSites.get( siteId ), timer: null } );
			dispatch(
				merge(
					activityLogRequest( siteId, {
						dateStart: newestDate,
						number: 100,
					} ),
					{
						meta: { dataLayer: { isWatching: true } },
					}
				)
			);
		}, POLL_INTERVAL );

		pollingSites.set( siteId, { ...prevState, newestDate, timer } );
	}
};

export const handleActivityLogRequest = action => {
	const { params = {}, siteId } = action;

	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ siteId }/activity`,
			query: omitBy(
				{
					action: params.action,
					date_end: params.date_end || params.dateEnd,
					date_start: params.date_start || params.dateStart,
					group: params.group,
					name: params.name,
					number: params.number,
				},
				a => a === undefined
			),
		},
		action
	);
};

export const receiveActivityLog = ( action, data ) => {
	return activityLogUpdate(
		action.siteId,
		data.items,
		data.totalItems,
		data.oldestItemTs,
		action.params
	);
};

export const receiveActivityLogError = () =>
	errorNotice( translate( 'Error receiving activity for site.' ) );

export default {
	[ ACTIVITY_LOG_REQUEST ]: [
		dispatchRequestEx( {
			fetch: handleActivityLogRequest,
			onSuccess: receiveActivityLog,
			onError: receiveActivityLogError,
			fromApi,
		} ),
		continuePolling,
	],
	[ ACTIVITY_LOG_WATCH ]: [ togglePolling ],
};
