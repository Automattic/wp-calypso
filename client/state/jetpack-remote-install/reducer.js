/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withStorageKey } from 'calypso/state/utils';
import {
	JETPACK_REMOTE_INSTALL,
	JETPACK_REMOTE_INSTALL_FAILURE,
	JETPACK_REMOTE_INSTALL_SUCCESS,
} from 'calypso/state/action-types';

export const isComplete = keyedReducer( 'url', ( state = false, { type } ) => {
	switch ( type ) {
		case JETPACK_REMOTE_INSTALL_SUCCESS:
			return true;
		case JETPACK_REMOTE_INSTALL:
			return false;
		default:
			return state;
	}
} );

export const errorCodeReducer = keyedReducer( 'url', ( state = null, { type, errorCode } ) => {
	switch ( type ) {
		case JETPACK_REMOTE_INSTALL_FAILURE:
			return errorCode;
		case JETPACK_REMOTE_INSTALL_SUCCESS:
		case JETPACK_REMOTE_INSTALL:
			return null;
		default:
			return state;
	}
} );

export const errorMessageReducer = keyedReducer(
	'url',
	( state = null, { type, errorMessage } ) => {
		switch ( type ) {
			case JETPACK_REMOTE_INSTALL_FAILURE:
				return errorMessage;
			case JETPACK_REMOTE_INSTALL_SUCCESS:
			case JETPACK_REMOTE_INSTALL:
				return null;
			default:
				return state;
		}
	}
);

const combinedReducer = combineReducers( {
	errorCode: errorCodeReducer,
	errorMessage: errorMessageReducer,
	isComplete,
} );

export default withStorageKey( 'jetpackRemoteInstall', combinedReducer );
