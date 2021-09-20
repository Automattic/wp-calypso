import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import appointmentDetails from './appointment-details/reducer';
import appointmentTimespan from './appointment-timespan/reducer';
import availableTimes from './available-times/reducer';
import isUserBlocked from './is-user-blocked/reducer';
import nextAppointment from './next-appointment/reducer';
import scheduleId from './schedule-id/reducer';
import signupForm from './signup-form/reducer';

const combinedReducer = combineReducers( {
	appointmentDetails,
	appointmentTimespan,
	availableTimes,
	nextAppointment,
	signupForm,
	scheduleId,
	isUserBlocked,
} );

const conciergeReducer = withStorageKey( 'concierge', combinedReducer );
export default conciergeReducer;
