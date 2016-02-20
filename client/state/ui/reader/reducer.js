/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import sidebar from './sidebar/reducer';
import fullpost from './fullpost/reducer';

export default combineReducers( {
	sidebar,
	fullpost
} );
