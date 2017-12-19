/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	dispatchMakeAppointmentSuccess,
	makeAppointment,
	makeAppointmentError,
	showMakeAppointmentError,
	toApi,
} from '../';
import { makeAppointmentSuccess } from 'state/concierge/actions';
import { CONCIERGE_MAKE_APPOINTMENT_REQUEST } from 'state/action-types';

// we are mocking impure-lodash here, so that showMakeAppointmentError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'makeAppointment()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_MAKE_APPOINTMENT_REQUEST,
				scheduleId: 123,
				beginTimestamp: Date.parse( '2017-01-01' ),
				customerId: 9527,
				siteId: 1006,
				meta: {
					description: 'concierge ... profit!',
				},
			};

			makeAppointment( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: `/concierge/schedules/${ action.scheduleId }/appointments`,
						apiNamespace: 'wpcom/v2',
						body: toApi( action ),
					},
					action
				)
			);
		} );

		test( 'dispatchMakeAppointmentSuccess()', () => {
			const dispatch = jest.fn();

			dispatchMakeAppointmentSuccess( { dispatch } );

			expect( dispatch ).toHaveBeenCalledWith( makeAppointmentSuccess() );
		} );

		test( 'showMakeAppointmentError()', () => {
			const dispatch = jest.fn();

			showMakeAppointmentError( { dispatch } );

			expect( dispatch ).toHaveBeenCalledWith( makeAppointmentError() );
		} );
	} );
} );
