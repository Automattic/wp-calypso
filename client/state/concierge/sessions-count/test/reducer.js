/** @format */

/**
 * Internal dependencies
 */
import { sessionsCount } from '../reducer';
import {
	CONCIERGE_SESSIONS_COUNT_REQUEST,
	CONCIERGE_SESSIONS_COUNT_UPDATE,
} from 'state/action-types';

describe( 'concierge/sessions-count/reducer', () => {
	test( 'should be defaulted as null.', () => {
		expect( sessionsCount( undefined, {} ) ).toBeNull();
	} );

	test( 'should be null on receiving the request action.', () => {
		expect(
			sessionsCount( undefined, {
				type: CONCIERGE_SESSIONS_COUNT_REQUEST,
			} )
		).toBeNull();
	} );

	test( 'should change sessions count on receiving the update action.', () => {
		const expectedCount = {
			available: 2,
			used: 5,
		};

		expect(
			sessionsCount( undefined, {
				type: CONCIERGE_SESSIONS_COUNT_UPDATE,
				count: {
					available: 2,
					used: 5,
				},
			} )
		).toEqual( expectedCount );
	} );
} );
