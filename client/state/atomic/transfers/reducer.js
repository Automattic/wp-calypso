import { withStorageKey } from '@automattic/state-utils';
import { ATOMIC_TRANSFER_SET_LATEST } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

function transfers( state = {}, action ) {
	switch ( action.type ) {
		case ATOMIC_TRANSFER_SET_LATEST:
			return {
				siteId: action.siteId,
				transfer: action?.transfer || null,
				error: action?.error || null,
			};
	}
	return state;
}

export default withStorageKey( 'atomicTransfers', keyedReducer( 'siteId', transfers ) );
