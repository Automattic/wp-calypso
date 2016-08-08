/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducer';
import optionalDependencies from './optional-dependencies/reducer';

export default combineReducers( {
	dependencyStore,
	optionalDependencies,
} );
