/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getBlogStickers from 'calypso/state/selectors/get-blog-stickers';

describe( 'getBlogStickers()', () => {
	test( 'should return stickers for a known blog', () => {
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

	test( 'should return null for an unknown blog', () => {
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
