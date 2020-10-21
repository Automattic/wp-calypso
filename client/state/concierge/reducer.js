/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import appointmentDetails from './appointment-details/reducer';
import appointmentTimespan from './appointment-timespan/reducer';
import availableTimes from './available-times/reducer';
import nextAppointment from './next-appointment/reducer';
import signupForm from './signup-form/reducer';
import scheduleId from './schedule-id/reducer';

const combinedReducer = combineReducers( {
	appointmentDetails,
	appointmentTimespan,
	availableTimes,
	nextAppointment,
	signupForm,
	scheduleId,
} );

const conciergeReducer = withStorageKey( 'concierge', combinedReducer );
export default conciergeReducer;
