/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import sidebar from './sidebar/reducer';
import cardExpansions from './card-expansions/reducer';

export default combineReducers( {
	sidebar,
	cardExpansions,
} );
