/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSiteTaxonomyTerms
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getSiteTaxonomyTerms()', () => {
		it( 'should return null if no site exists', () => {
			const terms = getSiteTaxonomyTerms( {}, 2916284, 'jetpack-portfolio' );

			expect( terms ).to.be.null;
		} );

		it( 'should return null if no taxonomies exist for site', () => {
			const terms = getSiteTaxonomyTerms( {
				terms: {
					2916284: {
						'jetpack-portfolio': {
							111: {
								ID: 111,
								name: 'Chicken and a biscuit'
							}
						}
					}
				}
			}, 2916284, 'jetpack-testimonials' );

			expect( terms ).to.be.null;
		} );

		it( 'should return array of matching terms for site taxonomy combo', () => {
			const terms = getSiteTaxonomyTerms( {
				terms: {
					2916284: {
						'jetpack-portfolio': {
							111: {
								ID: 111,
								name: 'Chicken and a biscuit'
							},
							112: {
								ID: 112,
								name: 'Ribs'
							}
						}
					}
				}
			}, 2916284, 'jetpack-portfolio' );

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit'
				}, {
					ID: 112,
					name: 'Ribs'
				}
			] );
		} );
	} );
} );
