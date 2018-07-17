/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { WORDADS_STATS_REQUEST } from 'state/action-types';
import { receiveStats } from 'state/wordads/stats/actions';

export default {
	[ WORDADS_STATS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: action =>
				http(
					{
						method: 'GET',
						path: `/sites/${ action.siteId }/wordads/stats`,
					},
					action
				),
			onSuccess: ( { siteId }, stats ) => receiveStats( siteId, stats ),
			onError: ( action, error ) => errorNotice( error ),
		} ),
	],
};
