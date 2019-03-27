/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import dependencyStore from './dependency-store/reducer';
import progress from './progress/reducer';
import optionalDependencies from './optional-dependencies/reducer';
import steps from './steps/reducer';
import flow from './flow/reducer';
import verticals from './verticals/reducer';

export default combineReducers( {
	dependencyStore,
	optionalDependencies,
	progress,
	steps,
	flow,
	verticals,
} );
