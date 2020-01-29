/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import appointmentDetails from './appointment-details/reducer';
import appointmentTimespan from './appointment-timespan/reducer';
import availableTimes from './available-times/reducer';
import nextAppointment from './next-appointment/reducer';
import signupForm from './signup-form/reducer';
import scheduleId from './schedule-id/reducer';
import hasAvailableConciergeSessions from './has-available-concierge-sessions/reducer';

export default combineReducers( {
	appointmentDetails,
	appointmentTimespan,
	availableTimes,
	nextAppointment,
	signupForm,
	scheduleId,
	hasAvailableConciergeSessions,
} );
