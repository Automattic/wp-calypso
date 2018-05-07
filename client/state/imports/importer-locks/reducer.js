/** @format */

/**
 * Internal dependencies
 */
import { keyedReducer } from 'state/utils';
import {
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RESET,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_START_IMPORTING,
} from 'state/action-types';

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
export default keyedReducer( 'importerId', ( state = {}, action ) => {
	switch ( action.type ) {
		case IMPORTS_IMPORT_CANCEL:
		case IMPORTS_IMPORT_RESET:
		case IMPORTS_AUTHORS_START_MAPPING:
			return true;
		case IMPORTS_START_IMPORTING:
			return false;
	}

	return state;
} );
