/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMediaItem } from '../';

describe( 'getMediaItem()', () => {
	it( 'should return null if the site is not in state', () => {
		const item = getMediaItem( {
			media: {
				items: {}
			}
		}, 2916284, 42 );

		expect( item ).to.be.null;
	} );

	it( 'should return null if the media for the site is not in state', () => {
		const item = getMediaItem( {
			media: {
				items: {
					2916284: {}
				}
			}
		}, 2916284, 42 );

		expect( item ).to.be.null;
	} );

	it( 'should return the media item', () => {
		const item = getMediaItem( {
			media: {
				items: {
					2916284: {
						42: { ID: 42, title: 'flowers' }
					}
				}
			}
		}, 2916284, 42 );

		expect( item ).to.eql( { ID: 42, title: 'flowers' } );
	} );
} );
