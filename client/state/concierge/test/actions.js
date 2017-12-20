/** @format */

/**
 * Internal dependencies
 */
import { requestConciergeAvailableTimes, updateConciergeAvailableTimes } from '../actions';

import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
} from 'state/action-types';

describe( 'state/concierge', () => {
	describe( 'actions', () => {
		test( 'requestConciergeAvailableTimes()', () => {
			const scheduleId = 123;

			expect( requestConciergeAvailableTimes( scheduleId ) ).toEqual( {
				type: CONCIERGE_AVAILABLE_TIMES_REQUEST,
				scheduleId,
			} );
		} );

		test( 'updateConciergeAvailableTimes()', () => {
			const availableTimes = [ 111, 222, 333 ];

			expect( updateConciergeAvailableTimes( availableTimes ) ).toEqual( {
				type: CONCIERGE_AVAILABLE_TIMES_UPDATE,
				availableTimes,
			} );
		} );
	} );
} );
