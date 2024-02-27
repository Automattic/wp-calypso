import {
	STATS_UTM_METRICS_REQUEST,
	STATS_UTM_METRICS_REQUEST_FAILURE,
	STATS_UTM_METRICS_RECEIVE,
} from 'calypso/state/action-types';
import { UTMMetricItem } from 'calypso/state/stats/utm-metrics/types';
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
			const utmKeys = Object.keys( data );

			return utmKeys.map( ( utmKey: string ) => {
				const parsedUtmKey = JSON.parse( utmKey );
				const value = data[ utmKey ];

				return {
					source: parsedUtmKey[ 0 ],
					medium: parsedUtmKey[ 1 ],
					label: `${ parsedUtmKey[ 0 ] } / ${ parsedUtmKey[ 1 ] }`,
					value,
				} as UTMMetricItem;
			} );
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
	}

	return state;
};

export const isLoading = keyedReducer( 'siteId', isLoadingReducer );

export default combineReducers( { data, isLoading } );
