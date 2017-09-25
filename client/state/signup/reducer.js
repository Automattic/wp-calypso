/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducer';
import optionalDependencies from './optional-dependencies/reducer';
import steps from './steps/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	dependencyStore,
	optionalDependencies,
	steps,
} );
