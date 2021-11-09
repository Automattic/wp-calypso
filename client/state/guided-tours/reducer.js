import { withStorageKey } from '@automattic/state-utils';
import {
	GUIDED_TOUR_UPDATE,
	GUIDED_TOUR_PAUSE,
	GUIDED_TOUR_RESUME,
} from 'calypso/state/action-types';

export function guidedTours( state = {}, action ) {
	switch ( action.type ) {
		case GUIDED_TOUR_UPDATE:
		case GUIDED_TOUR_PAUSE:
		case GUIDED_TOUR_RESUME: {
			const { type, ...update } = action;
			return { ...state, ...update };
		}
	}
	return state;
}

export default withStorageKey( 'guidedTours', guidedTours );
