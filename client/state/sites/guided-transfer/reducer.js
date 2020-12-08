/**
 * Internal dependencies
 */
import {
	GUIDED_TRANSFER_HOST_DETAILS_SAVE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	GUIDED_TRANSFER_STATUS_RECEIVE,
	GUIDED_TRANSFER_STATUS_REQUEST,
	GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
	GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { guidedTransferStatusSchema } from './schema';

// Stores the status of guided transfers per site
export const status = withSchemaValidation( guidedTransferStatusSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case GUIDED_TRANSFER_STATUS_RECEIVE:
			return {
				...state,
				[ action.siteId ]: action.guidedTransferStatus,
			};
	}

	return state;
} );

// Tracks whether we're fetching the status of a guided transfer for a site
export const isFetching = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case GUIDED_TRANSFER_STATUS_REQUEST:
			return {
				...state,
				[ action.siteId ]: true,
			};
		case GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS:
			return {
				...state,
				[ action.siteId ]: false,
			};
		case GUIDED_TRANSFER_STATUS_REQUEST_FAILURE:
			return {
				...state,
				[ action.siteId ]: false,
			};
	}

	return state;
} );

// Tracks whether we're fetching the status of a guided transfer for a site
export const error = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case GUIDED_TRANSFER_HOST_DETAILS_SAVE:
			return {
				...state,
				[ action.siteId ]: null,
			};
		case GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS:
			return {
				...state,
				[ action.siteId ]: null,
			};
		case GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE: {
			let errorCode = true;
			if ( action.error && action.error.error ) {
				errorCode = action.error.error;
			}
			return { ...state, [ action.siteId ]: errorCode };
		}
	}

	return state;
} );

// Tracks whether we're saving host details on a guided transfer for a site
export const isSaving = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case GUIDED_TRANSFER_HOST_DETAILS_SAVE:
			return {
				...state,
				[ action.siteId ]: true,
			};
		case GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS:
			return {
				...state,
				[ action.siteId ]: false,
			};
		case GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE:
			return {
				...state,
				[ action.siteId ]: false,
			};
	}

	return state;
} );

export default combineReducers( {
	error,
	isFetching,
	isSaving,
	status,
} );
