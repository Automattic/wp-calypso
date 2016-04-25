
/**
 * External dependencies
 */
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import {
	SHOW_GUIDED_TOUR,
	UPDATE_GUIDED_TOUR,
} from 'state/action-types';

export function guidedTour( state = {}, action ) {
	switch ( action.type ) {
		case SHOW_GUIDED_TOUR:
			const { stepName = 'init' } = action;
			return {
				stepName,
				shouldShow: action.shouldShow,
				shouldDelay: action.shouldDelay,
				shouldReallyShow: ( action.shouldShow || state.shouldShow ) && ! action.shouldDelay,
				tour: action.tour,
			};
		case UPDATE_GUIDED_TOUR:
			return Object.assign( {}, state, omit( action, 'type' ) );
	}
	return state;
}

export default guidedTour;
