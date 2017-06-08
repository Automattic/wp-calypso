/**
 * Internal dependencies
 */
import {
	REWIND_RESTORE,
	REWIND_RESTORE_COMPLETED,
	REWIND_RESTORE_UPDATE_ERROR,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

// TODO (seear): Use real state when we add restore status data-layer
const restoreStartState = () => ( {
	percent: 0,
	status: 'running',
} );

const restoreCompleteState = () => ( {
	percent: 100,
	status: 'success',
} );
const stubNull = () => null;

export const restoreError = keyedReducer( 'siteId', createReducer( {}, {
	[ REWIND_RESTORE ]: stubNull,
	[ REWIND_RESTORE_COMPLETED ]: stubNull,
	[ REWIND_RESTORE_UPDATE_ERROR ]: ( state, { error } ) => error,
} ) );

export const restoreProgress = keyedReducer( 'siteId', createReducer( {}, {
	[ REWIND_RESTORE ]: restoreStartState,
	[ REWIND_RESTORE_COMPLETED ]: restoreCompleteState,
	[ REWIND_RESTORE_UPDATE_ERROR ]: stubNull,
} ) );
