/**
 * Internal dependencies
 */
import { getLoadingTabs } from 'state/stats/chart-tabs/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';

export const isLoadingStats = (
	state,
	siteId,
	chartTab,
	chartPeriod,
	insightsQuery,
	topPostsQuery,
	visitsQuery
) =>
	getLoadingTabs( state, siteId, chartPeriod ).includes( chartTab ) ||
	isRequestingSiteStatsForQuery( state, siteId, 'statsInsights', insightsQuery ) ||
	isRequestingSiteStatsForQuery( state, siteId, 'statsTopPosts', topPostsQuery ) ||
	isRequestingSiteStatsForQuery( state, siteId, 'statsVisits', visitsQuery );

export const getMostPopularDatetime = ( state, siteId, query ) => {
	const insightsData = getSiteStatsNormalizedData( state, siteId, 'statsInsights', query );
	return {
		day: insightsData?.day,
		time: insightsData?.hour,
	};
};

export const getTopPostAndPage = ( state, siteId, query ) => {
	const data = getSiteStatsForQuery( state, siteId, 'statsTopPosts', query );

	if ( ! data ) {
		return {
			post: null,
			page: null,
		};
	}

	const topPosts = {};

	Object.values( data.days ).forEach( ( { postviews: posts } ) => {
		posts.forEach( ( post ) => {
			if ( post.id in topPosts ) {
				topPosts[ post.id ].views += post.views;
			} else {
				topPosts[ post.id ] = post;
			}
		} );
	} );

	const sortedTopPosts = Object.values( topPosts ).sort( ( a, b ) => a.views > b.views );

	if ( ! sortedTopPosts.length ) {
		return {
			post: null,
			page: null,
		};
	}

	return {
		post: sortedTopPosts.find( ( { type } ) => type === 'post' ),
		page: sortedTopPosts.find( ( { type } ) => type === 'page' ),
	};
};

export const getViewAndVisitors = ( state, siteId, query ) => {
	const visits = getSiteStatsNormalizedData( state, siteId, 'statsVisits', query );

	if ( ! visits ) {
		return {
			views: null,
			visitors: null,
		};
	}

	return {
		views: visits.reduce( ( views, dailyVisits ) => views + dailyVisits.views, 0 ),
		visitors: visits.reduce( ( views, dailyVisits ) => views + dailyVisits.visitors, 0 ),
	};
};
