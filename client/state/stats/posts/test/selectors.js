/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingPostStats,
	getPostStat,
	getPostStats,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingPostStats()', () => {
		it( 'should return false if the stat is not attached', () => {
			const state = {
				stats: {
					posts: {
						requesting: {
							2916284: {
								2454: { views: true }
							}
						}
					}
				}
			};
			const isRequesting = isRequestingPostStats( state, 2916284, 2454, [ 'countComments' ] );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the stat is not fetching', () => {
			const state = {
				stats: {
					posts: {
						requesting: {
							2916284: {
								2454: { 'views,years': false }
							}
						}
					}
				}
			};
			const isRequesting = isRequestingPostStats( state, 2916284, 2454, [ 'views', 'years' ] );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site is fetching', () => {
			const state = {
				stats: {
					posts: {
						requesting: {
							2916284: {
								2454: { 'views,years': true }
							}
						}
					}
				}
			};
			const isRequesting = isRequestingPostStats( state, 2916284, 2454, [ 'views', 'years' ] );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getPostStat()', () => {
		it( 'should return null if the site is not tracked', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 }
							}
						}
					}
				}
			};
			const statValue = getPostStat( state, 2916284, 2454, 'countComments' );

			expect( statValue ).to.be.null;
		} );

		it( 'should return the post stat for a siteId, postId and stat key', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 }
							}
						}
					}
				}
			};
			const statValue = getPostStat( state, 2916284, 2454, 'views' );

			expect( statValue ).to.eql( 2 );
		} );
	} );

	describe( 'getPostStats()', () => {
		it( 'should return null if the site is not tracked', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 }
							}
						}
					}
				}
			};
			const statValue = getPostStats( state, 2916285, 2454 );

			expect( statValue ).to.be.null;
		} );

		it( 'should return the post stats for a siteId, postId', () => {
			const state = {
				stats: {
					posts: {
						items: {
							2916284: {
								2454: { views: 2 }
							}
						}
					}
				}
			};
			const statValue = getPostStats( state, 2916284, 2454 );

			expect( statValue ).to.eql( { views: 2 } );
		} );
	} );
} );
