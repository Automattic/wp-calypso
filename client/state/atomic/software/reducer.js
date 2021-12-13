import { withStorageKey } from '@automattic/state-utils';
import { ATOMIC_SOFTWARE_SET_STATUS } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

function software( state = {}, action ) {
	switch ( action.type ) {
		case ATOMIC_SOFTWARE_SET_STATUS:
			return { ...state, softwareSet: action.softwareSet, ...action.status };
	}
}

export default withStorageKey(
	'atomicSoftware',
	keyedReducer( 'siteId', keyedReducer( 'softwareSet', software ) )
);
