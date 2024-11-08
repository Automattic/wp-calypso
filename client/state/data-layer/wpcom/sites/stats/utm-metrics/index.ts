import { processQueryParams } from 'calypso/my-sites/stats/hooks/utils';
import { STATS_UTM_METRICS_REQUEST, STATS_UTM_TOP_POSTS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	receiveMetrics,
	receiveMetricsByPost,
	requestMetricsFail,
	receiveTopPosts,
} from 'calypso/state/stats/utm-metrics/actions';
import type { AnyAction } from 'redux';

export const fetch = ( action: AnyAction ) => {
	const { siteId, utmParam, postId, query = {} } = action;
	const processedQuery = processQueryParams( query );

	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/stats/utm/${ utmParam }`,
				apiVersion: '1.1',
				query: {
					max: processedQuery.max,
					date: processedQuery.date,
					days: processedQuery.days,
					start_date: processedQuery.start_date || '',
					post_id: postId || '',
					// Only query top posts if postId is not provided or 0.
					query_top_posts: ! postId ? true : false,
				},
			},
			action
		),
	];
};

export const fetchTopPosts = ( action: AnyAction ) => {
	const { siteId, utmParam, paramValues } = action;

	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/stats/utm/${ utmParam }/top_posts`,
				apiVersion: '1.1',
				query: {
					utm_param_values: paramValues,
					max: 10,
					// Today's date in yyyy-mm-dd format.
					date: new Date().toISOString().split( 'T' )[ 0 ],
					days: 7,
				},
			},
			action
		),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/stats/utm-metrics/index.js', {
	[ STATS_UTM_METRICS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess: ( { siteId, postId, siteSlug }: AnyAction, data: object ) => {
				if ( postId ) {
					return receiveMetricsByPost( siteId, postId, data );
				}

				return receiveMetrics( siteId, data, siteSlug );
			},
			onError: ( { siteId }: AnyAction ) => requestMetricsFail( siteId ),
			// fromApi,
		} ),
	],
	[ STATS_UTM_TOP_POSTS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchTopPosts,
			onSuccess: ( { siteId, paramValues, siteSlug }: AnyAction, data: object ) =>
				receiveTopPosts( siteId, paramValues, data, siteSlug ),
			onError: () => null,
		} ),
	],
} );

export default {};
