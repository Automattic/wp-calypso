/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import optionalDependencies from './optional-dependencies/reducer';
import steps from './steps/reducer';

export default combineReducersWithPersistence( {
	dependencyStore,
	optionalDependencies,
	steps,
} );
