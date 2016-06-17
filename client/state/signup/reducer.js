/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import dependencyStore from './dependency-store/reducers';

export default combineReducers( {
	dependencyStore
} );
