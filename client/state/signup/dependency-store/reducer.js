/**
 * Internal dependencies
 */
import {
	SIGNUP_DEPENDENCY_STORE_UPDATE,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_COMPLETE_RESET,
} from 'calypso/state/action-types';
import { dependencyStoreSchema } from './schema';
import { withSchemaValidation } from 'calypso/state/utils';

const EMPTY = {};

function reducer( state = EMPTY, action ) {
	switch ( action.type ) {
		case SIGNUP_DEPENDENCY_STORE_UPDATE:
			return { ...state, ...action.dependencies };

		case SIGNUP_PROGRESS_SUBMIT_STEP:
		case SIGNUP_PROGRESS_COMPLETE_STEP: {
			const { providedDependencies } = action.step;
			if ( ! providedDependencies ) {
				return state;
			}
			return { ...state, ...providedDependencies };
		}

		case SIGNUP_COMPLETE_RESET:
			return EMPTY;

		default:
			return state;
	}
}

export default withSchemaValidation( dependencyStoreSchema, reducer );
