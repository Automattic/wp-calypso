import { withStorageKey } from '@automattic/state-utils';
import { ATOMIC_SOFTWARE_SET_STATUS } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

function software( state = {}, action ) {
	switch ( action.type ) {
		case ATOMIC_SOFTWARE_SET_STATUS:
			return {
				siteId: action.siteId,
				softwareSet: action.softwareSet,
				status: action?.status || null,
				error: action?.error || null,
			};
	}
	return state;
}

export default withStorageKey(
	'atomicSoftware',
	keyedReducer( 'siteId', keyedReducer( 'softwareSet', software ) )
);
