/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import appointmentDetails from './appointment-details/reducer';
import availableTimes from './available-times/reducer';
import nextAppointment from './next-appointment/reducer';
import signupForm from './signup-form/reducer';

export default combineReducers( {
	appointmentDetails,
	availableTimes,
	nextAppointment,
	signupForm,
} );
