/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getBlogStickers } from '../';

describe( 'getBlogStickers()', () => {
	it( 'should return stickers for a known blog', () => {
		const prevState = {
			sites: {
				blogStickers: {
					items: {
						123: [ 'dont-recommend' ],
					},
				},
			},
		};
		const blogId = 123;
		const nextState = getBlogStickers( prevState, blogId );
		expect( nextState ).to.eql( [ 'dont-recommend' ] );
	} );

	it( 'should return null for an unknown blog', () => {
		const prevState = {
			sites: {
				blogStickers: {
					items: {
						123: [ 'dont-recommend' ],
					},
				},
			},
		};
		const blogId = 124;
		const nextState = getBlogStickers( prevState, blogId );
		expect( nextState ).to.eql( null );
	} );
} );
