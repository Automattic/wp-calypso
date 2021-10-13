import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { transform as appointmentTransformer } from 'calypso/state/data-layer/wpcom/concierge/schedules/appointments/detail/from-api';
import responseSchema from './schema';

export const convertToMilliseconds = ( timestampInSeconds ) => timestampInSeconds * 1000;

export const transform = ( response ) => {
	const nextAppointment =
		response.next_appointment === null ? null : appointmentTransformer( response.next_appointment );

	return {
		availableTimes: response.available_times.map( convertToMilliseconds ),
		appointmentTimespan: response.appointment_timespan,
		nextAppointment,
		scheduleId: response.schedule_id,
		isUserBlocked: response.is_blocked,
	};
};

export default makeJsonSchemaParser( responseSchema, transform );
