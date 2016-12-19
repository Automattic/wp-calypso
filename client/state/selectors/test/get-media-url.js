/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMediaUrl } from '../';

describe( 'getMediaUrl()', () => {
	it( 'should return null if the item is not in state', () => {
		const url = getMediaUrl( {
			media: {
				items: {
					2916284: {}
				}
			}
		}, 2916284, 42 );

		expect( url ).to.be.null;
	} );

	it( 'should return null if the media item URL is invalid', () => {
		const url = getMediaUrl( {
			media: {
				items: {
					2916284: {
						42: { ID: 42, title: 'flowers' }
					}
				}
			}
		}, 2916284, 42 );

		expect( url ).to.be.null;
	} );

	it( 'should return a safe variation of the media URL', () => {
		const url = getMediaUrl( {
			media: {
				items: {
					2916284: {
						42: {
							ID: 42,
							title: 'flowers',
							URL: 'https://example.files.wordpress.com/2014/06/flower.gif'
						}
					}
				}
			}
		}, 2916284, 42 );

		expect( url ).to.equal( 'https://example.files.wordpress.com/2014/06/flower.gif' );
	} );
} );
