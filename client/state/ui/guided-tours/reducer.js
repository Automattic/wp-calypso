
/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { GUIDED_TOUR_UPDATE } from 'state/action-types';

export function guidedTour( state = {}, action ) {
	switch ( action.type ) {
		case GUIDED_TOUR_UPDATE:
			return Object.assign( {}, state, omit( action, 'type' ) );
	}
	return state;
}

export default guidedTour;
