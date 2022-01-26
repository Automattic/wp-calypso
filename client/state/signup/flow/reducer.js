import {
	SIGNUP_CURRENT_FLOW_NAME_SET,
	SIGNUP_PREVIOUS_FLOW_NAME_SET,
	SIGNUP_FLOW_ADD_EXCLUDE_STEPS,
	SIGNUP_FLOW_REMOVE_EXCLUDE_STEPS,
	SIGNUP_FLOW_RESET_EXCLUDE_STEPS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { currentFlowNameSchema, previousFlowNameSchema, excludedStepsSchema } from './schema';

const EMPTY_EXCLUDE_STEPS = [];

export const currentFlowName = withSchemaValidation(
	currentFlowNameSchema,
	( state = '', { flowName, type } ) => ( type === SIGNUP_CURRENT_FLOW_NAME_SET ? flowName : state )
);

export const previousFlowName = withSchemaValidation(
	previousFlowNameSchema,
	( state = '', { flowName, type } ) =>
		type === SIGNUP_PREVIOUS_FLOW_NAME_SET ? flowName : state
);

export const excludedSteps = withSchemaValidation(
	excludedStepsSchema,
	( state = EMPTY_EXCLUDE_STEPS, { type, steps } ) => {
		switch ( type ) {
			case SIGNUP_FLOW_ADD_EXCLUDE_STEPS: {
				return Array.from( new Set( [ ...state, ...steps ] ) );
			}
			case SIGNUP_FLOW_REMOVE_EXCLUDE_STEPS: {
				const removeStepsSet = new Set( steps );
				return state.filter( ( step ) => ! removeStepsSet.has( step ) );
			}
			case SIGNUP_FLOW_RESET_EXCLUDE_STEPS:
				return EMPTY_EXCLUDE_STEPS;
			default:
				return state;
		}
	}
);

export default combineReducers( {
	currentFlowName,
	previousFlowName,
	excludedSteps,
} );
