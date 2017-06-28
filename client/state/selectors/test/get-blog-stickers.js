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
		const stateIn = {
				sites: {
					blogStickers: {
						items: {
							123: [ 'dont-recommend' ],
						}
					}
				}
			},
			blogId = 123;
		const output = getBlogStickers( stateIn, blogId );
		expect( output ).to.eql( [ 'dont-recommend' ] );
	} );

	it( 'should return null for an unknown blog', () => {
		const stateIn = {
				sites: {
					blogStickers: {
						items: {
							123: [ 'dont-recommend' ],
						}
					}
				}
			},
			blogId = 124;
		const output = getBlogStickers( stateIn, blogId );
		expect( output ).to.eql( null );
	} );
} );
