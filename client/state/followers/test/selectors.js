/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getFollowersForQuery } from '../selectors';

describe( 'selctors', () => {
	describe( '#getFollowersForQuery()', () => {
		it( 'should should only return followers that match query', () => {
			const state = {
				followers: {
					items: {
						101: { ID: 101, avatar: 'https://1.gravatar.com/avatar', avatar_URL: 'https://1.gravatar.com/avatar', login: 'test101', label: 'Test Person101', display_name: 'test101' },
						201: { ID: 201, avatar: 'https://1.gravatar.com/avatar', avatar_URL: 'https://1.gravatar.com/avatar', login: 'test201', label: 'Test Person201', display_name: 'test201' },
					},
					queries: {
						'siteId=555': [ 101 ]
					}
				}
			};
			const query = { siteId: 555 };
			expect( getFollowersForQuery( state, query ) ).to.eql( [ { ID: 101, avatar: 'https://1.gravatar.com/avatar', avatar_URL: 'https://1.gravatar.com/avatar', login: 'test101', label: 'Test Person101', display_name: 'test101' } ] );
		} );
		it( 'should return null for untracked queries', () => {
			const state = {
				followers: {
					queries: {}
				}
			};
			const query = { siteId: 555 };
			expect( getFollowersForQuery( state, query ) ).to.be.null;
		} );
	} );
} );
