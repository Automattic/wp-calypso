/** @format */
/**
 * Internal dependencies
 */
import { TWO_FACTOR_AUTHENTICATION_SUBSYSTEM_CHANGE } from 'state/action-types';
import { createReducer, combineReducers } from 'state/utils';

export const isEnabled = createReducer( null, {
	[ TWO_FACTOR_AUTHENTICATION_SUBSYSTEM_CHANGE ]: ( state, { enabled } ) => !! enabled,
} );

export const isInitialized = createReducer( false, {
	[ TWO_FACTOR_AUTHENTICATION_SUBSYSTEM_CHANGE ]: ( state, { initialized } ) => !! initialized,
} );

export const isReauthorizationRequired = createReducer( null, {
	[ TWO_FACTOR_AUTHENTICATION_SUBSYSTEM_CHANGE ]: ( state, { reauthorizationRequired } ) =>
		!! reauthorizationRequired,
} );

export default combineReducers( { isEnabled, isInitialized, isReauthorizationRequired } );
