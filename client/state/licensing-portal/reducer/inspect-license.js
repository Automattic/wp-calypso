/**
 * Internal dependencies
 */
import {
	JETPACK_LICENSING_INSPECT_LICENSE_KEY_UPDATE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withoutPersistence } from 'calypso/state/utils';

export const initialState = {
	licenseKey: '',
	isInspecting: false,
	error: '',
	result: '',
};

export const licenseKey = withoutPersistence( ( state = initialState.licenseKey, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_KEY_UPDATE:
			return action.licenseKey;
	}

	return state;
} );

export const isInspecting = withoutPersistence( ( state = initialState.isInspecting, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST:
			return true;

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS:
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE:
			return false;
	}

	return state;
} );

export const result = withoutPersistence( ( state = initialState.result, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST:
			return '';

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS:
			return action.license;
	}

	return state;
} );

export const error = withoutPersistence( ( state = initialState.error, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST:
			return '';

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE:
			return `${ action.error.status }: ${ action.error.message }`;
	}

	return state;
} );

export default combineReducers( {
	licenseKey,
	isInspecting,
	error,
	result,
} );
