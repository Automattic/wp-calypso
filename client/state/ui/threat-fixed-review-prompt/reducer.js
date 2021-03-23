/**
 * Internal dependencies
 */
import { THREAT_FIXED_REVIEW_PROMPT } from 'calypso/state/action-types';

const initialState = {
	isVisible: false,
	fixDate: null,
};

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case THREAT_FIXED_REVIEW_PROMPT:
			return {
				isVisible: action.isVisible,
				fixDate: action.fixDate,
			};
	}
	return state;
};
