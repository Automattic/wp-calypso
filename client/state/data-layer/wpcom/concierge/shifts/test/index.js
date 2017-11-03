/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { handleFetchConciergeShifts } from '../';
import { CONCIERGE_SHIFTS_FETCH } from 'state/action-types';

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'handleFetchConciergeShifts()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_SHIFTS_FETCH,
				scheduleId: 123,
			};

			handleFetchConciergeShifts( { dispatch }, action );

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
	} );
} );
