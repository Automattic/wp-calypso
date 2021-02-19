/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import responseSchema from './schema';
import { transform as appointmentTransformer } from 'calypso/state/data-layer/wpcom/concierge/schedules/appointments/detail/from-api';

export const convertToMilliseconds = ( timestampInSeconds ) => timestampInSeconds * 1000;

export const transform = ( response ) => {
	const nextAppointment =
		response.next_appointment === null ? null : appointmentTransformer( response.next_appointment );

	return {
		availableTimes: response.available_times.map( convertToMilliseconds ),
		appointmentTimespan: response.appointment_timespan,
		nextAppointment: nextAppointment,
		scheduleId: response.schedule_id,
	};
};

export default makeJsonSchemaParser( responseSchema, transform );
