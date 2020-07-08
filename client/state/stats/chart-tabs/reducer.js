/**
 * External dependencies
 */
import { pick, set, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withSchemaValidation } from 'state/utils';
import { STATS_CHART_COUNTS_REQUEST, STATS_CHART_COUNTS_RECEIVE } from 'state/action-types';
import { countsSchema } from './schema';
import { QUERY_FIELDS } from './constants';

/**
 * Returns the updated count records state after an action has been dispatched.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const counts = withSchemaValidation(
	countsSchema,
	keyedReducer(
		'siteId',
		keyedReducer( 'period', ( state = [], action ) => {
			switch ( action.type ) {
				case STATS_CHART_COUNTS_RECEIVE: {
					// Workaround to prevent new data from being appended to previous data when range period differs.
					// See https://github.com/Automattic/wp-calypso/pull/41441#discussion_r415918092
					if ( action.data.length !== state.length ) {
						return action.data;
					}

					let areThereChanges = false;

					const newState = action.data.reduce(
						( nextState, recordFromApi ) => {
							const index = nextState.findIndex(
								( entry ) => entry.period === recordFromApi.period
							);
							if ( index >= 0 ) {
								const newRecord = { ...nextState[ index ], ...recordFromApi };
								if ( ! isEqual( nextState[ index ], newRecord ) ) {
									areThereChanges = true;
									nextState[ index ] = newRecord;
								}
							} else {
								areThereChanges = true;
								nextState.push( recordFromApi );
							}
							return nextState;
						},
						[ ...state ]
					);

					// Avoid changing state if nothing's changed.
					return areThereChanges ? newState : state;
				}
			}
			return state;
		} )
	)
);

/**
 * Returns the loading state after an action has been dispatched.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const isLoading = keyedReducer(
	'siteId',
	keyedReducer( 'period', ( state = {}, action ) => {
		switch ( action.type ) {
			case STATS_CHART_COUNTS_REQUEST: {
				return action.statFields.reduce(
					( nextState, statField ) => set( nextState, statField, true ),
					{ ...state }
				);
			}
			case STATS_CHART_COUNTS_RECEIVE: {
				return Object.keys( pick( action.data[ 0 ], QUERY_FIELDS ) ).reduce(
					( nextState, statField ) => set( nextState, statField, false ),
					{ ...state }
				);
			}
			// TODO: Add failure handling
		}
		return state;
	} )
);

export default combineReducers( { counts, isLoading } );
