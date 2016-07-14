/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducer';

export default combineReducers( {
	dependencyStore,
} );
