/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getFirstImageForTag,
	isRequestingTagImages
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getFirstImageForTag()', () => {
		it( 'should return undefined if there is no image available', () => {
			const state = {
				reader: {
					tags: {
						images: {
							items: {}
						}
					}
				}
			};
			expect( getFirstImageForTag( state, 'banana' ) ).to.equal( undefined );
		} );

		it( 'should return the first image if images exist for a tag', () => {
			const firstBananaImage = { url: 'http://example.com/banana1.jpg' };
			const secondBananaImage = { url: 'http://example.com/banana2.jpg' };
			const firstAppleImage = { url: 'http://example.com/apple1.jpg' };
			const state = {
				reader: {
					tags: {
						images: {
							items: {
								banana: [
									firstBananaImage,
									secondBananaImage
								],
								apple: [
									firstAppleImage
								]
							}
						}
					}
				}
			};
			expect( getFirstImageForTag( state, 'banana' ) ).to.eql( firstBananaImage );
			expect( getFirstImageForTag( state, 'apple' ) ).to.eql( firstAppleImage );
		} );
	} );

	describe( '#isRequestingTagImages()', () => {
		it( 'should return true if requesting images for the specified tag', () => {
			const state = {
				reader: {
					tags: {
						images: {
							requesting: {
								banana: true,
								feijoa: false
							}
						}
					}
				}
			};
			expect( isRequestingTagImages( state, 'banana' ) ).to.equal( true );
			expect( isRequestingTagImages( state, 'feijoa' ) ).to.equal( false );
			expect( isRequestingTagImages( state, 'unknown' ) ).to.equal( false );
		} );
	} );
} );
