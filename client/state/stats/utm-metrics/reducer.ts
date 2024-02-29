import {
	STATS_UTM_METRICS_REQUEST,
	STATS_UTM_METRICS_REQUEST_FAILURE,
	STATS_UTM_METRICS_RECEIVE,
	STATS_UTM_METRICS_RECEIVE_BY_POST,
	STATS_UTM_TOP_POSTS_REQUEST,
	STATS_UTM_TOP_POSTS_RECEIVE,
} from 'calypso/state/action-types';
import { UTMMetricItem, UTMMetricItemTopPost } from 'calypso/state/stats/utm-metrics/types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { schema } from './schema';
import type { Reducer, AnyAction } from 'redux';

/**
 * Returns the updated UTM metrics state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const dataReducer = ( state = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case STATS_UTM_METRICS_RECEIVE: {
			const data = action.data.top_utm_values;
			const UTMMetricKeys = Object.keys( data );

			return {
				...state,
				metrics: UTMMetricKeys.map( ( UTMMetricKey: string ) => {
					const parsedKey = JSON.parse( UTMMetricKey );
					const value = data[ UTMMetricKey ];

					return {
						source: parsedKey[ 0 ],
						medium: parsedKey[ 1 ],
						label: `${ parsedKey[ 0 ] } / ${ parsedKey[ 1 ] }`,
						value,
						paramValues: UTMMetricKey,
					} as UTMMetricItem;
				} ),
			};
		}

		case STATS_UTM_METRICS_RECEIVE_BY_POST: {
			const data = action.data.top_utm_values;
			const UTMMetricKeys = Object.keys( data );

			const { metricsByPost } = state as {
				metricsByPost: { [ key: string ]: Array< UTMMetricItem > };
			};

			return {
				...state,
				metricsByPost: {
					...metricsByPost,
					[ action.postId ]: UTMMetricKeys.map( ( UTMMetricKey: string ) => {
						const parsedKey = JSON.parse( UTMMetricKey );
						const value = data[ UTMMetricKey ];

						return {
							source: parsedKey[ 0 ],
							medium: parsedKey[ 1 ],
							label: `${ parsedKey[ 0 ] } / ${ parsedKey[ 1 ] }`,
							value,
						} as UTMMetricItem;
					} ),
				},
			};
		}

		case STATS_UTM_TOP_POSTS_RECEIVE: {
			const data = action.data.top_posts;
			const { topPosts } = state as {
				topPosts: { [ key: string ]: Array< UTMMetricItemTopPost > };
			};

			return {
				...state,
				topPosts: {
					...topPosts,
					[ action.paramValues ]: data.map( ( topPost: UTMMetricItemTopPost ) => {
						return {
							id: topPost.id,
							label: topPost.title,
							value: topPost.views,
							href: topPost.href,
						};
					} ),
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
