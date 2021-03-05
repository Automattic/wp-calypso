/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { SIGNUP_CURRENT_FLOW_NAME_SET } from 'calypso/state/action-types';
import { currentFlowNameSchema } from './schema';

export const currentFlowName = withSchemaValidation(
	currentFlowNameSchema,
	( state = '', { flowName, type } ) => ( type === SIGNUP_CURRENT_FLOW_NAME_SET ? flowName : state )
);

export default combineReducers( {
	currentFlowName,
} );
