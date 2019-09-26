/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getTagImages, shouldRequestTagImages } from '../selectors';

describe( 'selectors', () => {
	describe( '#getTagImages()', () => {
		test( 'should return undefined if there is no image available', () => {
			const state = {
				reader: {
					tags: {
						images: {
							items: {},
						},
					},
				},
			};
			expect( getTagImages( state, 'banana' ) ).to.equal( undefined );
		} );

		test( 'should return the an image if images exist for a tag', () => {
			const firstBananaImage = { url: 'http://example.com/banana1.jpg' };
			const secondBananaImage = { url: 'http://example.com/banana2.jpg' };
			const state = {
				reader: {
					tags: {
						images: {
							items: {
								banana: [ firstBananaImage, secondBananaImage ],
							},
						},
					},
				},
			};
			expect( getTagImages( state, 'banana' ) ).to.have.length( 2 );
			expect( getTagImages( state, 'apple' ) ).to.eql( undefined );
		} );
	} );

	describe( '#isRequestingTagImages()', () => {
		test( 'should return true if requesting images for the specified tag', () => {
			const state = {
				reader: {
					tags: {
						images: {
							requesting: {
								banana: true,
								feijoa: false,
							},
							items: {
								pants: [ { url: 'foo' } ],
							},
						},
					},
				},
			};
			expect( shouldRequestTagImages( state, 'banana' ) ).to.equal( false );
			expect( shouldRequestTagImages( state, 'feijoa' ) ).to.equal( true );
			expect( shouldRequestTagImages( state, 'unknown' ) ).to.equal( true );
			expect( shouldRequestTagImages( state, 'pants' ) ).to.equal( false );
		} );
	} );
} );
