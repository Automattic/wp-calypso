/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { exponentialBackoff } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import {
	fetchConciergeShifts,
	storeFetchedConciergeShifts,
	showConciergeShiftsFetchError,
	conciergeShiftsFetchErrorNotice,
} from '../';
import { updateConciergeShifts } from 'state/concierge/actions';
import { CONCIERGE_SHIFTS_REQUEST } from 'state/action-types';

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'fetchConciergeShifts()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_SHIFTS_REQUEST,
				scheduleId: 123,
			};

			fetchConciergeShifts( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'GET',
						path: `/concierge/schedules/${ action.scheduleId }/shifts`,
						apiNamespace: 'wpcom/v2',
						retryPolicy: exponentialBackoff(),
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

			expect( dispatch ).toHaveBeenCalledWith( updateConciergeShifts( mockShifts ) );
		} );

		test( 'showConciergeShiftsFetchError()', () => {
			const dispatch = jest.fn();

			showConciergeShiftsFetchError( { dispatch } );

			// It should be enough to make sure it dispatches a error notice action here,
			// instead for the whole action object and the text.
			expect( dispatch ).toHaveBeenCalledWith( conciergeShiftsFetchErrorNotice );
		} );
	} );
} );
