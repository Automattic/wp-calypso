/**
 * Internal dependencies
 */
import {
	getFollowersForQuery,
	isFetchingFollowersForQuery,
	getTotalFollowersForQuery,
} from '../selectors';
import { getSerializedQuery } from '../utils';

describe( 'selctors', () => {
	describe( '#getFollowersForQuery()', () => {
		test( 'should should only return followers that match query', () => {
			const state = {
				followers: {
					items: {
						101: {
							ID: 101,
							avatar: 'https://1.gravatar.com/avatar',
							avatar_URL: 'https://1.gravatar.com/avatar',
							login: 'test101',
							label: 'Test Person101',
							display_name: 'test101',
						},
						201: {
							ID: 201,
							avatar: 'https://1.gravatar.com/avatar',
							avatar_URL: 'https://1.gravatar.com/avatar',
							login: 'test201',
							label: 'Test Person201',
							display_name: 'test201',
						},
					},
					queries: {
						[ getSerializedQuery( { siteId: 555 } ) ]: {
							ids: [ 101 ],
						},
					},
				},
			};
			const query = { siteId: 555 };
			expect( getFollowersForQuery( state, query ) ).toEqual( [ state.followers.items[ 101 ] ] );
		} );

		test( 'should return null for untracked queries', () => {
			const state = {
				followers: {
					queries: {},
				},
			};
			const query = { siteId: 555 };
			expect( getFollowersForQuery( state, query ) ).toBeNull;
		} );
	} );

	describe( '#isFetchingFollowersForQuery', () => {
		test( 'should return true if currently fetching', () => {
			const serializedQuery = getSerializedQuery( { siteId: 555 } );
			const state = {
				followers: {
					queryRequests: {
						[ serializedQuery ]: true,
					},
				},
			};
			expect( isFetchingFollowersForQuery( state, { siteId: 555 } ) ).toBe( true );
		} );

		test( 'should return false if not currently fetching', () => {
			const serializedQuery = getSerializedQuery( { siteId: 555 } );
			const state = {
				followers: {
					queryRequests: {
						[ serializedQuery ]: false,
					},
				},
			};
			expect( isFetchingFollowersForQuery( state, { siteId: 555 } ) ).toBe( false );
		} );

		test( 'should return false if no data is available', () => {
			const state = { followers: { queryRequests: {} } };

			expect( isFetchingFollowersForQuery( state, { siteId: 555 } ) ).toBe( false );
		} );
	} );

	describe( '#getTotalFollowersForQuery', () => {
		test( 'should return the total number of followers for a query', () => {
			const serializedQuery = getSerializedQuery( { siteId: 555 } );
			const state = {
				followers: {
					queries: {
						[ serializedQuery ]: {
							total: 5,
						},
					},
				},
			};
			expect( getTotalFollowersForQuery( state, { siteId: 555 } ) ).toBe( 5 );
		} );

		test( "should return `undefined` if there's no data", () => {
			const state = { followers: { queries: {} } };

			expect( getTotalFollowersForQuery( state, { siteId: 555 } ) ).toBeUndefined();
		} );
	} );
} );
