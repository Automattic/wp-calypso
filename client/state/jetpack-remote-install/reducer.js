import { withStorageKey } from '@automattic/state-utils';
import {
	JETPACK_REMOTE_INSTALL,
	JETPACK_REMOTE_INSTALL_FAILURE,
	JETPACK_REMOTE_INSTALL_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

export const isRemoteInstallingJetpack = keyedReducer( 'url', ( state = false, { type } ) => {
	switch ( type ) {
		case JETPACK_REMOTE_INSTALL:
			return true;
		case JETPACK_REMOTE_INSTALL_SUCCESS:
		case JETPACK_REMOTE_INSTALL_FAILURE:
			return false;
		default:
			return state;
	}
} );

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
	isRemoteInstallingJetpack,
} );

export default withStorageKey( 'jetpackRemoteInstall', combinedReducer );
