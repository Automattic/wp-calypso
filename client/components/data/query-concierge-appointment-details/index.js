import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestConciergeAppointmentDetails } from 'calypso/state/concierge/actions';

function QueryConciergeAppointmentDetails( { scheduleId, appointmentId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestConciergeAppointmentDetails( scheduleId, appointmentId ) );
	}, [ dispatch, scheduleId, appointmentId ] );

	return null;
}

export default QueryConciergeAppointmentDetails;
