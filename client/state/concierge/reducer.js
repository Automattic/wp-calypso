/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import shifts from './shifts/reducer';
import signupForm from './signupForm/reducer';

export default combineReducers( {
	shifts,
	signupForm,
} );
