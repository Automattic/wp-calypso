/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { isFeaturedImageInContent } from '../utils';

describe( 'isFeaturedImageInContent', () => {
	it( 'should detect identical urls', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/image.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).to.equal( 1 );
	} );

	it( 'should return false when no images', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example.com/image.jpg',
			},
			images: [],
		};
		expect( isFeaturedImageInContent( post ) ).to.be.false;
	} );

	it( 'should return false when image is not in content', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/one.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).to.be.false;
	} );

	it( 'should ignore hostname when comparing', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example2.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/image.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).to.equal( 1 );
	} );

	it( 'should understand photon urls embed the hostname when comparing', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://i2.wp.com/example2.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/image.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).to.equal( 1 );
	} );
} );
