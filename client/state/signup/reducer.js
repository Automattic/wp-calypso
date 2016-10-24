/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducer';
import steps from './steps/reducer';

export default combineReducers( {
	dependencyStore,
	steps,
} );
