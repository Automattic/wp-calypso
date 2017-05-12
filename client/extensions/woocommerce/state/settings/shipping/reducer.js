/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import zones from './zones/reducer';

export default combineReducers( {
	zones,
} );
