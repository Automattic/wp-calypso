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
import { withSchemaValidation } from 'state/utils';
import steps from 'signup/config/steps-pure';
const EMPTY = {};

function getStateDependenciesNotInStep( state, stepName ) {
	const { providesDependencies: currentStepDependencySchemaArray = [] } = steps[ stepName ] ?? {};

	const otherDependenciesInFlow = Object.keys( state ).reduce( ( otherDeps, dep ) => {
		if ( ! currentStepDependencySchemaArray.includes( dep ) ) {
			return {
				...otherDeps,
				[ dep ]: state[ dep ],
			};
		}
		return otherDeps;
	}, {} );
	return otherDependenciesInFlow;
}

function reducer( state = EMPTY, action ) {
	switch ( action.type ) {
		case SIGNUP_DEPENDENCY_STORE_UPDATE:
			return { ...state, ...action.dependencies };

		case SIGNUP_PROGRESS_SUBMIT_STEP:
		case SIGNUP_PROGRESS_COMPLETE_STEP: {
			const { stepName, providedDependencies: dependenciesProvidedByCurrentStep } = action.step;
			/**
			 * This is to allow the removal of a given dependency which is supposed to be provided by the current step
			 * Therefore, optional dependencies in a given step can now be removed when moving back and forth across a given flow
			 * The assumption is if a step provides a dependency it should be specified in the action, otherwise it is removed.
			 */
			const otherDependenciesInFlow = getStateDependenciesNotInStep( state, stepName );
			const finalState = { ...otherDependenciesInFlow, ...dependenciesProvidedByCurrentStep };
			return finalState;
		}

		case SIGNUP_COMPLETE_RESET:
			return EMPTY;

		default:
			return state;
	}
}

export default withSchemaValidation( dependencyStoreSchema, reducer );
