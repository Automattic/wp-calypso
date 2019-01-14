/** @format */

/**
 * External dependencies
 */
import { get, pick, set, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import { STATS_CHART_COUNTS_REQUEST, STATS_CHART_COUNTS_RECEIVE } from 'state/action-types';
import { countsSchema } from './schema';
import { QUERY_FIELDS } from './constants';

/**
 * Returns the updated count records state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function counts( state = {}, action ) {
	switch ( action.type ) {
		case STATS_CHART_COUNTS_RECEIVE: {
			const ID = 'period';
			const records = get( state, `${ action.siteId }.${ action.period }`, [] ).slice();
			const recordIds = records.map( count => count[ ID ] );

			let areThereChanges = false;

			// Merge existing records with records from API
			action.data.forEach( recordFromApi => {
				const index = recordIds.indexOf( recordFromApi[ ID ] );
				if ( index >= 0 ) {
					const newRecords = { ...records[ index ], ...recordFromApi };
					if ( ! isEqual( newRecords, records[ index ] ) ) {
						areThereChanges = true;
						records[ index ] = newRecords;
					}
				} else {
					areThereChanges = true;
					records.push( recordFromApi );
				}
			} );

			// Avoid changing state if nothing's changed.
			if ( ! areThereChanges ) {
				return state;
			}

			const newState = { ...state };
			set( newState, `${ action.siteId }.${ action.period }`, records );
			return newState;
		}
	}
	return state;
}
counts.schema = countsSchema;

/**
 * Returns the loading state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
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
