/**
 * Internal dependencies
 */
import {
	JETPACK_LICENSING_INSPECT_LICENSE_UPDATE,
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

/**
 * `Reducer` function which handles request/response actions to/from WP REST-API for license inspection.
 *
 * @param {object} state - current state
 * @param {object} action - plans action
 * @returns {object} updated state
 */
/*export default withoutPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST:
			return {
				...state,
				licenseKey: action.licenseKey,
				isInspecting: true,
				error: '',
				result: '',
			};

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS:
			return {
				...state,
				isInspecting: false,
				result: action.data,
			};

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE:
			return {
				...state,
				isInspecting: false,
				error: action.data,
			};
	}

	return state;
} );*/

export const licenseKey = ( state = initialState.licenseKey, action ) => {
	console.log( 'HERE!' );
	debugger;
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_UPDATE:
			return action.licenseKey;
	}

	return state;
};

export const isInspecting = ( state = initialState.isInspecting, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST:
			return true;

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS:
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE:
			return false;
	}

	return state;
};

export const error = ( state = initialState.error, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST:
			return '';

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE:
			return action.data;
	}

	return state;
};

export const result = ( state = initialState.result, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST:
			return '';

		case JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS:
			return action.data;
	}

	return state;
};

export default combineReducers( {
	licenseKey,
	isInspecting,
	error,
	result,
} );
