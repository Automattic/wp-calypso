/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingPostStat,
	getPostStat
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingPostStat()', () => {
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
			const isRequesting = isRequestingPostStat( state, 'countComments', 2916284, 2454 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the stat is not fetching', () => {
			const state = {
				stats: {
					posts: {
						requesting: {
							2916284: {
								2454: { views: false }
							}
						}
					}
				}
			};
			const isRequesting = isRequestingPostStat( state, 'views', 2916284, 2454 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site is fetching', () => {
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
			const isRequesting = isRequestingPostStat( state, 'views', 2916284, 2454 );

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
			const statValue = getPostStat( state, 'countComments', 2916284, 2454 );

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
			const statValue = getPostStat( state, 'views', 2916284, 2454 );

			expect( statValue ).to.eql( 2 );
		} );
	} );
} );
