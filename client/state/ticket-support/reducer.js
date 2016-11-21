/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import isRequesting from './is-requsting/reducer';
import configuration from './configuration/reducer';

export default combineReducers( {
	isRequesting,
	configuration,
} );
