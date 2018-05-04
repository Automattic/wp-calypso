/** @format */

/**
 * Internal dependencies
 */
import { IMPORTS_IMPORT_LOCK, IMPORTS_IMPORT_UNLOCK } from 'state/action-types';

/**
 * Track whether an importer is currently locked or unlocked
 *
 * A locked importer signifies that it should not be able to change its status
 * until an action explicitly unlocks it.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export default ( state = {}, action ) => {
	switch ( action.type ) {
		case IMPORTS_IMPORT_LOCK:
			if ( ! action.importerId ) {
				return state;
			}

			return {
				...state,
				[ action.importerId ]: true,
			};
		case IMPORTS_IMPORT_UNLOCK:
			if ( ! action.importerId ) {
				return state;
			}

			return {
				...state,
				[ action.importerId ]: false,
			};
	}

	return state;
};
