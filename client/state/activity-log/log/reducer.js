/**
 * Internal dependencies
 */
// import {
// 	REWIND_STATUS_ERROR,
// 	REWIND_STATUS_UPDATE,
// } from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

// FIXME: Real action
const unknownAction = '__NO_ACTION__';

export const logError = createReducer( {}, {
	[ unknownAction ]: keyedReducer( 'siteId', () => null ),
} );

export const logItems = createReducer( {}, {
	[ unknownAction ]: keyedReducer( 'siteId', () => null ),
} );
