/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
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
		case GUIDED_TOUR_RESUME:
			return Object.assign( {}, state, omit( action, 'type' ) );
	}
	return state;
}

export default withStorageKey( 'guidedTours', guidedTours );
