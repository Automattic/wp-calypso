/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import shipping from './shipping/reducer';

export default combineReducers( {
	shipping,
} );
