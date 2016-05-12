/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSiteTaxonomyTerms,
	getSiteTaxonomyTerms
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingSiteTaxonomyTerms()', () => {
		it( 'should return false if state tree is empty', () => {
			const isRequesting = isRequestingSiteTaxonomyTerms( {}, 2916284, 'category' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if no request has been made for site and taxonomy combo', () => {
			const isRequesting = isRequestingSiteTaxonomyTerms( {
				terms: {
					requesting: {}
				}
			}, 2916284, 'category' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if no request has been made for site and taxonomy', () => {
			const isRequesting = isRequestingSiteTaxonomyTerms( {
				terms: {
					requesting: {
						2916284: {
							'random-taxonomy': true
						}
					}
				}
			}, 2916284, 'category' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if request has finished for site taxonomy combo', () => {
			const isRequesting = isRequestingSiteTaxonomyTerms( {
				terms: {
					requesting: {
						2916284: {
							'random-taxonomy': false,
							category: false
						}
					}
				}
			}, 2916284, 'random-taxonomy' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if requesting for site taxonomy combo', () => {
			const isRequesting = isRequestingSiteTaxonomyTerms( {
				terms: {
					requesting: {
						2916284: {
							'random-taxonomy': false,
							category: true
						}
					}
				}
			}, 2916284, 'category' );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getSiteTaxonomyTerms()', () => {
		it( 'should return null if no site exists', () => {
			const terms = getSiteTaxonomyTerms( {}, 2916284, 'jetpack-portfolio' );

			expect( terms ).to.be.null;
		} );

		it( 'should return null if no taxonomies exist for site', () => {
			const terms = getSiteTaxonomyTerms( {
				terms: {
					items: {
						2916284: {
							'jetpack-portfolio': {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								}
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
					items: {
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
