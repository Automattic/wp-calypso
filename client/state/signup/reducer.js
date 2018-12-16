/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import dependencyStore from './dependency-store/reducer';
import progress from './progress/reducer';
import optionalDependencies from './optional-dependencies/reducer';
import steps from './steps/reducer';
import { SIGNUP_CURRENT_FLOW_SET } from 'state/action-types';

// TODO: move to own dir
// action
export function setCurrentFlow( flowName ) {
	return {
		type: SIGNUP_CURRENT_FLOW_SET,
		flowName,
	};
}
// reducer
export const currentFlow = ( state = '', { type, flowName } ) =>
	type === SIGNUP_CURRENT_FLOW_SET ? flowName : state;

export default combineReducers( {
	dependencyStore,
	optionalDependencies,
	progress,
	steps,
	currentFlow,
} );
