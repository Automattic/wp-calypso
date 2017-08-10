/** @format */
/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducer';
import { combineReducers } from 'state/utils';
import optionalDependencies from './optional-dependencies/reducer';
import steps from './steps/reducer';

export default combineReducers( {
	dependencyStore,
	optionalDependencies,
	steps,
} );
