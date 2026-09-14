import { withStorageKey } from '@automattic/state-utils';
import { GUIDED_TOUR_UPDATE } from 'calypso/state/action-types';

export function guidedTours( state = {}, action ) {
	switch ( action.type ) {
		case GUIDED_TOUR_UPDATE: {
			const { type, ...update } = action;
			return { ...state, ...update };
		}
	}
	return state;
}

export default withStorageKey( 'guidedTours', guidedTours );
