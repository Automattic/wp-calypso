import {
	STATS_UTM_METRICS_REQUEST,
	STATS_UTM_METRICS_REQUEST_FAILURE,
	STATS_UTM_METRICS_RECEIVE,
	STATS_UTM_METRICS_RECEIVE_BY_POST,
	STATS_UTM_TOP_POSTS_REQUEST,
	STATS_UTM_TOP_POSTS_RECEIVE,
} from 'calypso/state/action-types';
import {
	UTMMetricItem,
	UTMMetricItemTopPostRaw,
	UTMMetricItemTopPost,
} from 'calypso/state/stats/utm-metrics/types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { schema } from './schema';
import type { Reducer, AnyAction } from 'redux';

const isValidJSONArray = ( string: string ) => {
	try {
		const parsed = JSON.parse( string );

		return Array.isArray( parsed );
	} catch ( e ) {
		return false;
	}
};

const topPostsParser = (
	posts: Array< UTMMetricItemTopPostRaw >,
	siteSlug?: string,
	utmData?: { [ key: string ]: string }
): Array< UTMMetricItemTopPost > => {
	return posts.map( ( topPost: UTMMetricItemTopPostRaw ) => ( {
		id: topPost.id,
		label: topPost.title,
		value: topPost.views,
		href: topPost.href,
		page: siteSlug ? `/stats/post/${ topPost.id }/${ siteSlug }` : null,
		actions: [
			{
				data: topPost.href,
				type: 'link',
			},
			{
				data: {
					url: topPost.href,
					...utmData,
				},
				type: 'url-builder',
			},
		],
	} ) );
};

const metricsParser = (
	UTMValues: { [ key: string ]: number },
	topPosts: { [ key: string ]: Array< UTMMetricItemTopPostRaw > } | undefined,
	siteSlug?: string,
	utmParam?: string
) => {
	const combinedKeys = Object.keys( UTMValues );
	// Stop fetching top posts by other requests
	// when `topPosts` is already fetched within the same request
	// or set to an empty object.
	const stopFurtherRequest = !! topPosts;

	return combinedKeys
		.sort( ( keyA: string, keyB: string ) => {
			return UTMValues[ keyB ] - UTMValues[ keyA ];
		} )
		.map( ( combinedKey: string ) => {
			const parsedKeys = isValidJSONArray( combinedKey )
				? JSON.parse( combinedKey )
				: [ combinedKey ];
			const value = UTMValues[ combinedKey ];
			const posts = topPosts && combinedKey in topPosts ? topPosts[ combinedKey ] : [];

			const data = {
				label: parsedKeys[ 0 ],
				value,
			} as UTMMetricItem;

			// Show the label for two UTM parameters: `utm_source,utm_medium`.
			if ( parsedKeys[ 1 ] ) {
				data.label += ` / ${ parsedKeys[ 1 ] }`;
			}

			// Show the label for three UTM parameters: `utm_campaign,utm_source,utm_medium`.
			if ( parsedKeys[ 2 ] ) {
				data.label += ` / ${ parsedKeys[ 2 ] }`;
			}

			// Prepare top posts of each UTM parameter value.
			if ( posts.length ) {
				const utmParamKeys = utmParam?.split( ',' );
				const UTMdata = utmParamKeys?.reduce(
					( acc, key, index ) => ( {
						...acc,
						[ key ]: parsedKeys[ index ],
					} ),
					{}
				);

				data.children = topPostsParser( posts, siteSlug, UTMdata );
			}

			// Set no `paramValues` to prevent top post requests.
			if ( stopFurtherRequest ) {
				return data;
			}

			return {
				...data,
				paramValues: combinedKey,
			};
		} );
};

/**
 * Returns the updated UTM metrics state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const dataReducer = ( state = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case STATS_UTM_METRICS_RECEIVE: {
			const values = action.data.top_utm_values || {};
			const topPosts = action.data.top_posts;
			const siteSlug = action.siteSlug;
			const utmParam = action.utmParam;

			return {
				...state,
				metrics: metricsParser( values, topPosts, siteSlug, utmParam ),
			};
		}

		case STATS_UTM_METRICS_RECEIVE_BY_POST: {
			const values = action.data.top_utm_values || {};

			const { metricsByPost } = state as {
				metricsByPost: { [ key: string ]: Array< UTMMetricItem > };
			};

			return {
				...state,
				metricsByPost: {
					...metricsByPost,
					[ action.postId ]: metricsParser( values, {} ),
				},
			};
		}

		case STATS_UTM_TOP_POSTS_RECEIVE: {
			const data = action.data.top_posts;
			const siteSlug = action.siteSlug;

			const { topPosts } = state as {
				topPosts: { [ key: string ]: Array< UTMMetricItemTopPostRaw > };
			};

			return {
				...state,
				topPosts: {
					...topPosts,
					[ action.paramValues ]: topPostsParser( data, siteSlug ),
				},
			};
		}
	}

	return state;
};

export const data = withSchemaValidation(
	schema,
	keyedReducer( 'siteId', withPersistence( dataReducer as Reducer ) )
);

/**
 * Returns the loading state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const isLoadingReducer = ( state = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case STATS_UTM_METRICS_REQUEST: {
			return true;
		}
		case STATS_UTM_METRICS_REQUEST_FAILURE: {
			return false;
		}
		case STATS_UTM_METRICS_RECEIVE: {
			return false;
		}
		case STATS_UTM_METRICS_RECEIVE_BY_POST: {
			return false;
		}
		case STATS_UTM_TOP_POSTS_REQUEST: {
			return true;
		}
		case STATS_UTM_TOP_POSTS_RECEIVE: {
			return false;
		}
	}

	return state;
};

export const isLoading = keyedReducer( 'siteId', isLoadingReducer );

export default combineReducers( { data, isLoading } );
