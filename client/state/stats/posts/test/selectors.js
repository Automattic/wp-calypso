import { isRequestingPostStats, getPostStat, getPostStats } from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingPostStats()', () => {
		test( 'should return false if the stat is not attached', () => {
			const state = {
				stats: {
					posts: {
						requesting: {
							2916284: {
								2454: { views: true },
							},
						},
					},
				},
			};
			const isRequesting = isRequestingPostStats( state, 2916284, 2454, [ 'countComments' ] );

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if the stat is not fetching', () => {
			const state = {
				stats: {
					posts: {
						requesting: {
							2916284: {
								2454: { 'views,years': false },
							},
						},
					},
				},
			};
			const isRequesting = isRequestingPostStats( state, 2916284, 2454, [ 'views', 'years' ] );

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if the site is fetching', () => {
			const state = {
				stats: {
					posts: {
						requesting: {
							2916284: {
								2454: { 'views,years': true },
							},
						},
					},
				},
			};
			const isRequesting = isRequestingPostStats( state, 2916284, 2454, [ 'views', 'years' ] );

			expect( isRequesting ).toBe( true );
		} );
	} );

	describe( '#getPostStat()', () => {
		test( 'should return null if the site is not tracked', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 },
							},
						},
					},
				},
			};
			const statValue = getPostStat( state, 2916284, 2454, 'countComments' );

			expect( statValue ).toBeNull();
		} );

		test( 'should return the post stat for a siteId, postId and stat key', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 },
							},
						},
					},
				},
			};
			const statValue = getPostStat( state, 2916284, 2454, 'views' );

			expect( statValue ).toEqual( 2 );
		} );
	} );

	describe( 'getPostStats()', () => {
		test( 'should return null if the site is not tracked', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 },
							},
						},
					},
				},
			};
			const statValue = getPostStats( state, 2916285, 2454 );

			expect( statValue ).toBeNull();
		} );

		test( 'should return the post stats for a siteId, postId', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 },
							},
						},
					},
				},
			};
			const statValue = getPostStats( state, 2916284, 2454 );

			expect( statValue ).toEqual( { views: 2 } );
		} );
	} );
} );
