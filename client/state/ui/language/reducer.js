/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	LOCALE_SET
} from 'state/action-types';

/**
 * Tracks the state of the ui locale
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
const localeSlug = ( state = 'en', action ) => {
	switch ( action.type ) {
		case LOCALE_SET:
			return action.localeSlug;
	}
	return state;
};

export default combineReducers( { localeSlug } );
