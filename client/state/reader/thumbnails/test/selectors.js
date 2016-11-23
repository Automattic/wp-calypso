/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getThumbnailForIframe,
	isRequestingThumbnailUrl,
} from '../selectors';

describe( 'selectors', () => {
	const embedUrl = 'embedUrl';
	const thumbnailUrl = 'thumbnailUrl';

	describe( '#getThumbnailForIframe()', () => {
		it( 'should return undefined if there is no image available', () => {
			const state = {
				reader: {
					thumbnails: {
						items: {},
					}
				}
			};
			expect( getThumbnailForIframe( state, embedUrl ) ).to.equal( undefined );
		} );

		it( 'should return the thumbnail if it exists for an iframe src', () => {
			const state = {
				reader: {
					thumbnails: {
						items: {
							[ embedUrl ]: thumbnailUrl
						}
					}
				}
			};
			expect( getThumbnailForIframe( state, embedUrl ) ).to.eql( thumbnailUrl );
		} );
	} );

	describe( '#isRequestingTagImages()', () => {
		it( 'should return true if requesting images for the specified tag', () => {
			const state = {
				reader: {
					thumbnails: {
						requesting: {
							[ embedUrl ]: true,
							[ embedUrl + '2' ]: false,
						}
					}
				}
			};
			expect( isRequestingThumbnailUrl( state, embedUrl ) ).to.equal( true );
			expect( isRequestingThumbnailUrl( state, embedUrl + '2' ) ).to.equal( false );
		} );
	} );
} );
