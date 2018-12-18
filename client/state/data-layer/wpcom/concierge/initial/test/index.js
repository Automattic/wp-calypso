/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	conciergeInitialFetchError,
	fetchConciergeInitial,
	storeFetchedConciergeInitial,
	showConciergeInitialFetchError,
} from '../';
import { updateConciergeInitial } from 'state/concierge/actions';
import { CONCIERGE_INITIAL_REQUEST } from 'state/action-types';

// we are mocking impure-lodash here, so that conciergeInitialFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'fetchConciergeInitial()', () => {
			const action = {
				type: CONCIERGE_INITIAL_REQUEST,
				scheduleId: 123,
			};

			expect( fetchConciergeInitial( action ) ).toEqual(
				http(
					{
						method: 'GET',
						path: `/concierge/schedules/${ action.scheduleId }/initial`,
						apiNamespace: 'wpcom/v2',
					},
					action
				)
			);
		} );

		test( 'storeFetchedConciergeInitial()', () => {
			const mockInitial = {
				available_times: [
					new Date( '2017-01-01 01:00:00' ),
					new Date( '2017-01-01 02:00:00' ),
					new Date( '2017-01-01 03:00:00' ),
				],
			};

			expect( storeFetchedConciergeInitial( {}, mockInitial ) ).toEqual(
				updateConciergeInitial( mockInitial )
			);
		} );

		test( 'showConciergeInitialFetchError()', () => {
			expect( showConciergeInitialFetchError() ).toEqual( conciergeInitialFetchError() );
		} );
	} );
} );
