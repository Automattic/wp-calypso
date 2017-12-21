/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	conciergeAvailableTimesFetchError,
	fetchConciergeAvailableTimes,
	storeFetchedConciergeAvailableTimes,
	showConciergeAvailableTimesFetchError,
} from '../';
import { updateConciergeAvailableTimes } from 'state/concierge/actions';
import { CONCIERGE_AVAILABLE_TIMES_REQUEST } from 'state/action-types';

// we are mocking impure-lodash here, so that conciergeAvailableTimesFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'fetchConciergeAvailableTimes()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_AVAILABLE_TIMES_REQUEST,
				scheduleId: 123,
			};

			fetchConciergeAvailableTimes( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'GET',
						path: `/concierge/schedules/${ action.scheduleId }/available_times`,
						apiNamespace: 'wpcom/v2',
					},
					action
				)
			);
		} );

		test( 'storeFetchedConciergeAvailableTimes()', () => {
			const dispatch = jest.fn();
			const mockAvailableTimes = [
				new Date( '2017-01-01 01:00:00' ),
				new Date( '2017-01-01 02:00:00' ),
				new Date( '2017-01-01 03:00:00' ),
			];

			storeFetchedConciergeAvailableTimes( { dispatch }, {}, mockAvailableTimes );

			expect( dispatch ).toHaveBeenCalledWith(
				updateConciergeAvailableTimes( mockAvailableTimes )
			);
		} );

		test( 'showConciergeAvailableTimesFetchError()', () => {
			const dispatch = jest.fn();

			showConciergeAvailableTimesFetchError( { dispatch } );

			expect( dispatch ).toHaveBeenCalledWith( conciergeAvailableTimesFetchError() );
		} );
	} );
} );
