/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	conciergeShiftsFetchError,
	fetchConciergeShifts,
	storeFetchedConciergeShifts,
	showConciergeShiftsFetchError,
} from '../';
import { updateConciergeShifts } from 'state/concierge/actions';
import { CONCIERGE_SHIFTS_REQUEST } from 'state/action-types';

// we are mocking impure-lodash here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

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

			expect( dispatch ).toHaveBeenCalledWith( conciergeShiftsFetchError() );
		} );
	} );
} );
