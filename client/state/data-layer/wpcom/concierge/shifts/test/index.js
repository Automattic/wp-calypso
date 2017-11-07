/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import {
	requestFetchConciergeShifts,
	storeFetchedConciergeShifts,
	showConciergeShiftsFetchError,
} from '../';
import {
	CONCIERGE_SHIFTS_REQUEST,
	CONCIERGE_SHIFTS_UPDATE,
	NOTICE_CREATE,
} from 'state/action-types';

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'requestFetchConciergeShifts()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_SHIFTS_REQUEST,
				scheduleId: 123,
			};

			requestFetchConciergeShifts( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'GET',
						path: `/concierge/schedules/${ action.scheduleId }/shifts`,
						apiNamespace: 'wpcom/v2',
						retryPolicy: noRetry(),
					},
					action
				)
			);
		} );

		test( 'storeFetchedConciergeShifts()', () => {
			const dispatch = jest.fn();
			const mockShifts = [
				{ description: 'shift 1' },
				{ description: 'shift 2' },
				{ description: 'shift 3' },
			];

			storeFetchedConciergeShifts( { dispatch }, {}, mockShifts );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: CONCIERGE_SHIFTS_UPDATE,
				shifts: mockShifts,
			} );
		} );

		test( 'showConciergeShiftsFetchError()', () => {
			const dispatch = jest.fn();

			showConciergeShiftsFetchError( { dispatch } );

			// It should be enough to make sure it dispatches a error notice action here,
			// instead for the whole action object and the text.
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: NOTICE_CREATE,
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
		} );
	} );
} );
