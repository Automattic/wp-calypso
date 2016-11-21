/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import isRequesting from './is-requsting';

export default combineReducers( {
	isRequesting,
} );
