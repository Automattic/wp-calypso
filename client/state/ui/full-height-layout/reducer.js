/**
 * External dependencies
 */
import { FULL_HEIGHT_LAYOUT_ON, FULL_HEIGHT_LAYOUT_OFF } from 'state/action-types';

const fullHeightLayoutReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case FULL_HEIGHT_LAYOUT_ON:
			return true;
		case FULL_HEIGHT_LAYOUT_OFF:
			return false;
		default:
			return state;
	}
};

export default fullHeightLayoutReducer;
