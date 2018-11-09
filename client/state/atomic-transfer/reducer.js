/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withSchemaValidation } from 'state/utils';
import { transferStates } from './constants';
import { atomicTransfer as schema } from './schema';
import {
	ATOMIC_TRANSFER_INITIATE_REQUEST as INITIATE,
	ATOMIC_TRANSFER_INITIATE_REQUEST_FAILURE as INITIATE_FAILURE,
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE as TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_RECEIVE as TRANSFER_UPDATE,
	ATOMIC_TRANSFER_SET as SET_TRANSFER,
} from 'state/action-types';

export const status = ( state = null, action ) => {
	switch ( action.type ) {
		case INITIATE:
			return transferStates.PENDING;
		case INITIATE_FAILURE:
			return transferStates.ERROR;
		case SET_TRANSFER:
			return action.status;
		case TRANSFER_UPDATE:
			return 'completed' === action.status ? transferStates.COMPLETED : state;
	}

	return state;
};
status.hasCustomPersistence = true;

export const fetchingTransfer = ( state = false, action ) => {
	switch ( action.type ) {
		case TRANSFER_REQUEST:
			return true;

		case TRANSFER_REQUEST_FAILURE:
			return false;

		default:
			return state;
	}
};

export const siteReducer = combineReducers( {
	status,
	fetchingTransfer,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
export default withSchemaValidation( schema, keyedReducer( 'siteId', siteReducer ) );
