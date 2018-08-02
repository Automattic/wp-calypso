/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingTopPosts, getTopPosts } from '../selectors';
import { getSerializedTopPostsQuery } from '../utils';

describe( 'selectors', () => {
	describe( '#isRequestingTopPosts()', () => {
		it( 'should return false if the request is not attached', () => {
			const state = {
				stats: {
					topPosts: {
						requesting: {
							[ getSerializedTopPostsQuery( { date: '2017-06-25' }, 2916284 ) ]: true,
						},
					},
				},
			};

			const isRequesting = isRequestingTopPosts( state, 2916284, { date: '2017-06-26' } );
			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the posts are not being fetched', () => {
			const state = {
				stats: {
					topPosts: {
						requesting: {
							[ getSerializedTopPostsQuery( { date: '2017-06-25' }, 2916284 ) ]: false,
						},
					},
				},
			};

			const isRequesting = isRequestingTopPosts( state, 2916284, { date: '2017-06-25' } );
			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the posts are being fetched', () => {
			const state = {
				stats: {
					topPosts: {
						requesting: {
							[ getSerializedTopPostsQuery( { date: '2017-06-25' }, 2916284 ) ]: true,
						},
					},
				},
			};

			const isRequesting = isRequestingTopPosts( state, 2916284, { date: '2017-06-25' } );
			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getTopPosts()', () => {
		it( 'should return null if the posts are not attached', () => {
			const state = { stats: { topPosts: { items: {} } } };
			const posts = getTopPosts( state, 2916284, { date: '2017-06-25' } );
			expect( posts ).to.be.null;
		} );

		it( 'should return the posts for a siteId, period and date', () => {
			const state = {
				stats: {
					topPosts: {
						items: {
							[ getSerializedTopPostsQuery( { date: '2017-06-25' }, 2916284 ) ]: {
								'2017-06-25': {
									postviews: [],
									total_views: 12,
								},
							},
						},
					},
				},
			};

			const posts = getTopPosts( state, 2916284, { date: '2017-06-25' } );
			expect( posts ).to.have.key( '2017-06-25' );
		} );
	} );
} );
