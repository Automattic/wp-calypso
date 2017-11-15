/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	conciergeSlotsFetchError,
	fetchConciergeSlots,
	storeFetchedConciergeSlots,
	showConciergeSlotsFetchError,
} from '../';
import { updateConciergeSlots } from 'state/concierge/actions';
import { CONCIERGE_SLOTS_REQUEST } from 'state/action-types';

// we are mocking impure-lodash here, so that conciergeSlotsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'fetchConciergeSlots()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_SLOTS_REQUEST,
				scheduleId: 123,
			};

			fetchConciergeSlots( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'GET',
						path: `/concierge/schedules/${ action.scheduleId }/slots`,
						apiNamespace: 'wpcom/v2',
					},
					action
				)
			);
		} );

		test( 'storeFetchedConciergeSlots()', () => {
			const dispatch = jest.fn();
			const mockSlots = [
				{ description: 'shift 1' },
				{ description: 'shift 2' },
				{ description: 'shift 3' },
			];

			storeFetchedConciergeSlots( { dispatch }, {}, mockSlots );

			expect( dispatch ).toHaveBeenCalledWith( updateConciergeSlots( mockSlots ) );
		} );

		test( 'showConciergeSlotsFetchError()', () => {
			const dispatch = jest.fn();

			showConciergeSlotsFetchError( { dispatch } );

			expect( dispatch ).toHaveBeenCalledWith( conciergeSlotsFetchError() );
		} );
	} );
} );
