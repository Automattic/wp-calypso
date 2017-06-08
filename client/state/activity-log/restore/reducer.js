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

// FIXME: Real action types
const unknownAction = '__NO_ACTION__';

export const restoreError = createReducer( {}, {
	[ unknownAction ]: keyedReducer( 'siteId', () => null ),
} );

export const restoreProgress = createReducer( {}, {
	[ unknownAction ]: keyedReducer( 'siteId', () => null ),
} );
