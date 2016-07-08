/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducers';
import optionalDependencies from './optional-dependencies/reducers';

export default combineReducers( {
	dependencyStore,
	optionalDependencies,
} );
