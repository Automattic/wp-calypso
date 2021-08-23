import { withStorageKey } from '@automattic/state-utils';
import { ATOMIC_TRANSFER_SET } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const atomicTransfer = ( state = {}, action ) => {
	switch ( action.type ) {
		case ATOMIC_TRANSFER_SET:
			return { ...state, ...action.transfer };
	}

	return state;
};

//export default atomicTransferReducers;
export default withStorageKey( 'atomicTransfer', keyedReducer( 'siteId', atomicTransfer ) );
