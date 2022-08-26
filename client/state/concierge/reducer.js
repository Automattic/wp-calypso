import { withStorageKey } from '@automattic/state-utils';
import conciergeSites from 'calypso/state/concierge/concierge-sites/reducer';
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
	conciergeSites,
	isUserBlocked,
	nextAppointment,
	signupForm,
	scheduleId,
} );

const conciergeReducer = withStorageKey( 'concierge', combinedReducer );
export default conciergeReducer;
