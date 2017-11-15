/** @format */

/**
 * Internal dependencies
 */
import { requestConciergeSlots, updateConciergeSlots } from '../actions';

import { CONCIERGE_SLOTS_REQUEST, CONCIERGE_SLOTS_UPDATE } from 'state/action-types';

describe( 'state/concierge', () => {
	describe( 'actions', () => {
		test( 'requestConciergeSlots()', () => {
			const scheduleId = 123;

			expect( requestConciergeSlots( scheduleId ) ).toEqual( {
				type: CONCIERGE_SLOTS_REQUEST,
				scheduleId,
			} );
		} );

		test( 'updateConciergeSlots()', () => {
			const slots = [
				{
					begin_timestamp: 100,
					end_timestamp: 300,
					schedule_id: 123,
					description: 'lovely slot 1',
				},
				{
					begin_timestamp: 200,
					end_timestamp: 400,
					schedule_id: 123,
					description: 'cute slot 2',
				},
			];

			expect( updateConciergeSlots( slots ) ).toEqual( {
				type: CONCIERGE_SLOTS_UPDATE,
				slots,
			} );
		} );
	} );
} );
