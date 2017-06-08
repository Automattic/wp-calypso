/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_RESTORE,
	REWIND_RESTORE_COMPLETED,
	REWIND_RESTORE_UPDATE_ERROR,
} from 'state/action-types';
import { keyedReducer, } from 'state/utils';

/**
 * Constants
 */
const restoreStartState = deepFreeze( {
	percent: 0,
	status: 'running',
} );
const restoreCompleteState = deepFreeze( {
	percent: 100,
	status: 'success',
} );

export const restoreError = keyedReducer( 'siteId', ( state = undefined, action ) => {
	switch ( action.type ) {
		case REWIND_RESTORE_UPDATE_ERROR:
			return pick( action, 'error' );
		case REWIND_RESTORE:
			return undefined;
		default:
			return state;
	}
} );

// FIXME: Add progress update action
export const restoreProgress = keyedReducer( 'siteId', ( state = undefined, action ) => {
	switch ( action.type ) {
		case REWIND_RESTORE:
			// FIXME: Include restore status in action
			return restoreStartState;
		case REWIND_RESTORE_COMPLETED:
			// FIXME: Include restore status in action
			return {
				...state,
				...restoreCompleteState,
			};
		case REWIND_RESTORE_UPDATE_ERROR:
			return undefined;
		default:
			return state;
	}
} );

// FIXME: Add progress persistence
