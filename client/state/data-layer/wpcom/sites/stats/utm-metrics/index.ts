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

const getDaysOfMonthFromDate = ( date: string ): number => {
	const dateObj = new Date( date );
	const year = dateObj.getFullYear();
	const month = dateObj.getMonth() + 1;

	return new Date( year, month, 0 ).getDate();
};

const daysInYearFromDate = ( date: string ) => {
	const dateObj = new Date( date );
	const year = dateObj.getFullYear();

	return ( year % 4 === 0 && year % 100 > 0 ) || year % 400 === 0 ? 366 : 365;
};

export const fetch = ( action: AnyAction ) => {
	const { siteId, utmParam, postId, query = {} } = action;

	// `num` is only for the period `day`.
	const num = query.num || 1;

	// Calculate the number of days to query based on the period.
	let days = num;
	switch ( query.period ) {
		case 'week':
			days = 7;
			break;
		case 'month':
			days = getDaysOfMonthFromDate( query.date );
			break;
		case 'year':
			days = daysInYearFromDate( query.date );
			break;
	}

	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/stats/utm/${ utmParam }`,
				apiVersion: '1.1',
				query: {
					max: 10,
					date: query.date || new Date().toISOString().split( 'T' )[ 0 ],
					days: days,
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
