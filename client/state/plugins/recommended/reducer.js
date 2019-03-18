/** @format */
/**
 * Internal dependencies
 */
import { PLUGINS_RECOMMENDED_REQUEST, PLUGINS_RECOMMENDED_RECEIVE } from 'state/action-types';

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGINS_RECOMMENDED_REQUEST: {
			return { ...state, [ action.siteId ]: null };
		}
		case PLUGINS_RECOMMENDED_RECEIVE: {
			return { ...state, [ action.siteId ]: action.data };
		}
	}
	return state;
};

export default items;
