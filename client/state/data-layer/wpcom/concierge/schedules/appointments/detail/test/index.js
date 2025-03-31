import { CONCIERGE_APPOINTMENT_DETAILS_REQUEST } from 'calypso/state/action-types';
import { updateConciergeAppointmentDetails } from 'calypso/state/concierge/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { errorNotice } from 'calypso/state/notices/actions';
import { fetchAppointmentDetails, onSuccess, onError } from '../';

describe( 'wpcom-api', () => {
	let originalRandomUUID;

	beforeAll( () => {
		originalRandomUUID = global.crypto.randomUUID;
		global.crypto.randomUUID = () => 'fake-uuid';
	} );

	afterAll( () => {
		global.crypto.randomUUID = originalRandomUUID;
	} );

	describe( 'concierge', () => {
		test( 'fetchAppointmentDetails()', () => {
			const action = {
				type: CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
				scheduleId: 123,
				appointmentId: 321,
			};

			expect( fetchAppointmentDetails( action ) ).toEqual(
				http(
					{
						method: 'GET',
						path: `/concierge/schedules/${ action.scheduleId }/appointments/${ action.appointmentId }/detail`,
						apiNamespace: 'wpcom/v2',
						retryPolicy: noRetry(),
					},
					action
				)
			);
		} );

		test( 'onSuccess()', () => {
			const mockAppointmentDetails = {
				id: 1,
				begin_timestamp: 123,
				options: {
					retryPolicy: { name: 'NO_RETRY' },
				},
			};

			expect(
				onSuccess( { appointmentId: mockAppointmentDetails.id }, mockAppointmentDetails )
			).toEqual(
				updateConciergeAppointmentDetails( mockAppointmentDetails.id, mockAppointmentDetails )
			);
		} );

		test( 'onError()', () => {
			expect( onError() ).toEqual(
				errorNotice( 'We could not find your appointment. Please try again later.' )
			);
		} );
	} );
} );
