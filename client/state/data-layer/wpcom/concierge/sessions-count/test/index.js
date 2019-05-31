/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { fetchConciergeSessionsCount, storeFetchedConciergeSessionsCount } from '../';
import { updateConciergeSessionsCount } from 'state/concierge/actions';
import { CONCIERGE_SESSIONS_COUNT_REQUEST } from 'state/action-types';

// we are mocking impure-lodash here, so that conciergeSessionsCountFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'fetchConciergeSessionsCount()', () => {
			const action = {
				type: CONCIERGE_SESSIONS_COUNT_REQUEST,
			};

			expect( fetchConciergeSessionsCount( action ) ).toEqual(
				http(
					{
						method: 'GET',
						path: '/concierge/sessions-count',
						apiNamespace: 'wpcom/v2',
					},
					action
				)
			);
		} );

		test( 'storeFetchedConciergeSessionsCount()', () => {
			const mockCount = {
				available: 10,
				used: 6,
			};

			expect( storeFetchedConciergeSessionsCount( {}, mockCount ) ).toEqual(
				updateConciergeSessionsCount( mockCount )
			);
		} );
	} );
} );
