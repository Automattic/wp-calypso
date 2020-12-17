/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	withoutPersistence,
	withSchemaValidation,
	withStorageKey,
} from 'calypso/state/utils';
import { atomicTransfer as schema } from './schema';
import {
	ATOMIC_TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET,
	ATOMIC_TRANSFER_COMPLETE,
} from 'calypso/state/action-types';

export const atomicTransfer = withSchemaValidation( schema, ( state = {}, action ) => {
	switch ( action.type ) {
		case ATOMIC_TRANSFER_SET: {
			const { transfer } = action;
			return { ...state, ...transfer };
		}
	}

	return state;
} );

export const fetchingTransfer = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ATOMIC_TRANSFER_REQUEST:
			return true;
		case ATOMIC_TRANSFER_REQUEST_FAILURE:
			return false;
		case ATOMIC_TRANSFER_COMPLETE:
			return false;
	}

	return state;
} );

export const atomicTransferReducers = combineReducers( {
	atomicTransfer,
	fetchingTransfer,
} );

//export default atomicTransferReducers;
export default withStorageKey( 'atomicTransfer', keyedReducer( 'siteId', atomicTransferReducers ) );
