/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingRecommendations,
	getRecommendations
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
	} );
} );
