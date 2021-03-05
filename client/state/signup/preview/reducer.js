/**
 * Internal dependencies
 */
import { SIGNUP_SITE_PREVIEW_SHOW, SIGNUP_SITE_PREVIEW_HIDE } from 'calypso/state/action-types';

const initialState = {
	isVisible: false,
};

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case SIGNUP_SITE_PREVIEW_SHOW:
			return {
				...state,
				isVisible: true,
			};
		case SIGNUP_SITE_PREVIEW_HIDE:
			return {
				...state,
				isVisible: false,
			};
		default:
			return state;
	}
};
