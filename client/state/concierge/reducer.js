/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'client/state/utils';
import availableTimes from './available-times/reducer';
import signupForm from './signup-form/reducer';

export default combineReducers( {
	availableTimes,
	signupForm,
} );
