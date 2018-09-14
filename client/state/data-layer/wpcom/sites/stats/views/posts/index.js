/**
 * External Dependencies
 *
 * @format
 */

/**
 * Internal Dependencies
 */
import { STATS_RECENT_POST_VIEWS_REQUEST } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveRecentPostViews } from 'state/stats/views/posts/actions';

export const fetch = action => {
	const { siteId, postIds, num, date, offset } = action;

	return http(
		{
			method: 'GET',
			path: `/sites/${ siteId }/stats/views/posts`,
			apiVersion: '1.1',
			query: {
				post_ids: postIds,
				num,
				date,
				offset,
			},
		},
		action
	);
};

export const onSuccess = ( { siteId }, data ) => receiveRecentPostViews( siteId, data );

export default {
	[ STATS_RECENT_POST_VIEWS_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError: () => {},
		} ),
	],
};
