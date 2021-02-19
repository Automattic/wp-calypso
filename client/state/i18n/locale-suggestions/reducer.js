/**
 * Internal dependencies
 */
import { I18N_LOCALE_SUGGESTIONS_ADD } from 'calypso/state/action-types';

export const items = ( state = null, action ) => {
	switch ( action.type ) {
		case I18N_LOCALE_SUGGESTIONS_ADD:
			return action.items;
		default:
			return state;
	}
};

export default items;
