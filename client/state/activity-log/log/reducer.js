/**
 * Internal dependencies
 */
import {
	ACTIVITY_LOG_UPDATE,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

// FIXME: No-op reducers
export const logError = keyedReducer( 'siteId', state => state );

export const logItems = keyedReducer( 'siteId', createReducer( [], {
	[ ACTIVITY_LOG_UPDATE ]: ( state, { data } ) => data,
} ) );
