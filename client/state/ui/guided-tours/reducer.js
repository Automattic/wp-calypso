
/**
 * External dependencies
 */
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import {
	GUIDED_TOUR_SHOW,
	GUIDED_TOUR_UPDATE,
} from 'state/action-types';

export function guidedTour( state = {}, action ) {
	switch ( action.type ) {
		case GUIDED_TOUR_SHOW:
			const { stepName = 'init' } = action;
			return {
				stepName,
				shouldShow: action.shouldShow,
				shouldDelay: action.shouldDelay,
				shouldReallyShow: ( action.shouldShow || state.shouldShow ) && ! action.shouldDelay,
				tour: action.tour,
			};
		case GUIDED_TOUR_UPDATE:
			return { ...state, ...omit( action, 'type' ) };
	}
	return state;
}

export default guidedTour;
