/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { ZONINATOR_UPDATE_LOCK } from '../action-types';

const lock = createReducer(
	{},
	{
		[ ZONINATOR_UPDATE_LOCK ]: ( state, { created, currentSession } ) => ( {
			created,
			currentSession,
		} ),
	}
);

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', lock ) );

export default combineReducers( {
	items,
} );
