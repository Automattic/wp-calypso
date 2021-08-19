/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import {
	SIGNUP_CURRENT_FLOW_NAME_SET,
	SIGNUP_PREVIOUS_FLOW_NAME_SET,
	SIGNUP_EXCLUDE_STEP_SET,
} from 'calypso/state/action-types';
import { currentFlowNameSchema, previousFlowNameSchema, excludedStepsSchema } from './schema';

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
	( state = [], { stepName, type } ) => ( type === SIGNUP_EXCLUDE_STEP_SET ? stepName : state )
);

export default combineReducers( {
	currentFlowName,
	previousFlowName,
	excludedSteps,
} );
