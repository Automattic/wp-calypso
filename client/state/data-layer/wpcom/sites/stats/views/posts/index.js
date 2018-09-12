/**
 * External Dependencies
 *
 * @format
 */

/**
 * Internal Dependencies
 */
import { SITES_STATS_VIEWS_POSTS_REQUEST } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receivePostsViews } from 'state/stats/views/posts/actions';

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

export const onSuccess = ( { siteId }, data ) => receivePostsViews( siteId, data );

export default {
	[ SITES_STATS_VIEWS_POSTS_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError: () => {},
		} ),
	],
};
