/** @format */

/**
 * Internal dependencies
 */
import {
	SIGNUP_DEPENDENCY_STORE_UPDATE,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_COMPLETE_RESET,
} from 'state/action-types';
import { dependencyStoreSchema } from './schema';

const EMPTY = {};

function reducer( state = EMPTY, action ) {
	switch ( action.type ) {
		case SIGNUP_DEPENDENCY_STORE_UPDATE:
			return { ...state, ...action.providedDependencies };

		case SIGNUP_PROGRESS_SUBMIT_STEP:
		case SIGNUP_PROGRESS_COMPLETE_STEP:
			return { ...state, ...action.step.providedDependencies };

		case SIGNUP_COMPLETE_RESET:
			return EMPTY;

		default:
			return state;
	}
}

reducer.schema = dependencyStoreSchema;

export default reducer;
