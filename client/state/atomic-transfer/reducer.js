import { withStorageKey } from '@automattic/state-utils';
import { ATOMIC_TRANSFER_REQUEST, ATOMIC_TRANSFER_SET } from 'calypso/state/action-types';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { keyedReducer } from 'calypso/state/utils';

export const atomicTransfer = ( state = {}, action ) => {
	switch ( action.type ) {
		case ATOMIC_TRANSFER_SET:
			return { ...state, ...action.transfer };
		case ATOMIC_TRANSFER_REQUEST: {
			if ( state.status !== transferStates.CLIENT_TIMEOUT ) {
				return state;
			}

			const { status, ...rest } = state;
			return rest;
		}
	}

	return state;
};

//export default atomicTransferReducers;
export default withStorageKey( 'atomicTransfer', keyedReducer( 'siteId', atomicTransfer ) );
