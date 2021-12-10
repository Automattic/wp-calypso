import { withStorageKey } from '@automattic/state-utils';
import { ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

function transfers( state = {}, action ) {
	switch ( action.type ) {
		case ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS:
			return { ...state, ...action };
	}
}

export default withStorageKey( 'atomicTransfers', keyedReducer( 'siteId', transfers ) );
