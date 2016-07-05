/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingRecommendations,
	getRecommendations,
	getRecommendationFollowCount
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingRecommendations()', () => {
		it( 'should return false if not fetching', () => {
			const isRequesting = isRequestingRecommendations( {
				reader: {
					start: {
						isRequestingRecommendations: false
					}
				}
			} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if fetching', () => {
			const isRequesting = isRequestingRecommendations( {
				reader: {
					start: {
						isRequestingRecommendations: true
					}
				}
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getRecommendations()', () => {
		it( 'should return an empty object if there are no recommendations', () => {
			const recs = getRecommendations( {
				reader: {
					start: {
						items: {}
					}
				}
			} );

			expect( recs ).to.eql( {} );
		} );

		it( 'should return a map of blog id / post id pairs', () => {
			expect( getRecommendations( {
				reader: {
					start: {
						items: {
							1: {
								site_ID: 1,
								post_ID: 1
							},
							2: {
								site_ID: 2
							}
						}
					}
				}
			} ) ).to.deep.equal( {
				1: {
					site_ID: 1,
					post_ID: 1
				},
				2: {
					site_ID: 2
				}
			} );
		} );
	} );

	describe( '#getRecommendationFollowCount()', () => {
		it( 'should return zero if nothing has been followed', () => {
			const count = getRecommendationFollowCount( {
				reader: {
					start: {
						recommendationsFollowed: []
					}
				}
			} );

			expect( count ).to.eq( 0 );
		} );

		it( 'should return the count if recommendations have been followed', () => {
			const count = getRecommendationFollowCount( {
				reader: {
					start: {
						recommendationsFollowed: [ 123, 456, 789 ]
					}
				}
			} );

			expect( count ).to.eq( 3 );
		} );
	} );
} );
