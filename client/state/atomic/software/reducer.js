import { withStorageKey } from '@automattic/state-utils';
import { ATOMIC_SOFTWARE_SET_STATUS, ATOMIC_SOFTWARE_SET_ERROR } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

function software( state = {}, action ) {
	switch ( action.type ) {
		case ATOMIC_SOFTWARE_SET_STATUS:
			return {
				...state,
				siteId: action.siteId,
				softwareSet: action.softwareSet,
				...action?.status,
			};

		case ATOMIC_SOFTWARE_SET_ERROR:
			return {
				...state,
				siteId: action.siteId,
				softwareSet: action.softwareSet,
				error: action.error,
			};
	}
	return state;
}

export default withStorageKey(
	'atomicSoftware',
	keyedReducer( 'siteId', keyedReducer( 'softwareSet', software ) )
);
