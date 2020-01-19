/**
 * Internal dependencies
 */
import { getRecentViewsForPost } from '../selectors';

describe( 'selectors', () => {
	const siteId = 3855820;
	const postId = 958;
	const state = {
		stats: {
			recentPostViews: {
				items: {
					[ siteId ]: {
						[ postId ]: { views: 8274 },
					},
				},
			},
		},
	};

	describe( '#getRecentViewsForPost()', () => {
		test( 'should return recent views for a post by site and id', () => {
			const recentViews = getRecentViewsForPost( state, siteId, postId );

			expect( recentViews ).toEqual( 8274 );
		} );

		test( 'should default to null', () => {
			const recentViews = getRecentViewsForPost( state, siteId, -1 );

			expect( recentViews ).toBeNull();
		} );
	} );
} );
