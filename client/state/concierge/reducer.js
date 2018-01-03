/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import availableTimes from './available-times/reducer';
import signupForm from './signup-form/reducer';

export default combineReducers( {
	availableTimes,
	signupForm,
} );
