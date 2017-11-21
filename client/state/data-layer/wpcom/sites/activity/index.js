/** @format */
/**
 * External dependencies
 */
import { omitBy } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import fromApi from './from-api';
import { ACTIVITY_LOG_REQUEST } from 'state/action-types';
import { activityLogUpdate } from 'state/activity-log/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';

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

export const receiveActivityLog = ( action, data ) =>
	activityLogUpdate( action.siteId, data, data.totalItems, action.params );

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
	],
};
