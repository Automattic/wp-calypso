/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThumbnailForIframe, isRequestingThumbnailUrl } from '../selectors';

describe( 'selectors', () => {
	const embedUrl = 'embedUrl';
	const thumbnailUrl = 'thumbnailUrl';

	describe( '#getThumbnailForIframe()', () => {
		test( 'should return undefined if there is no thumbnail available', () => {
			const state = {
				reader: {
					thumbnails: {
						items: {},
					},
				},
			};
			expect( getThumbnailForIframe( state, embedUrl ) ).to.equal( undefined );
		} );

		test( 'should return the thumbnail if it exists for an iframe src', () => {
			const state = {
				reader: {
					thumbnails: {
						items: {
							[ embedUrl ]: thumbnailUrl,
						},
					},
				},
			};
			expect( getThumbnailForIframe( state, embedUrl ) ).to.eql( thumbnailUrl );
		} );
	} );

	describe( '#isRequestingThumbnailUrl()', () => {
		test( 'should return true if requesting thumbnail for the embed', () => {
			const state = {
				reader: {
					thumbnails: {
						requesting: {
							[ embedUrl ]: true,
							[ embedUrl + '2' ]: false,
						},
					},
				},
			};
			expect( isRequestingThumbnailUrl( state, embedUrl ) ).to.equal( true );
			expect( isRequestingThumbnailUrl( state, embedUrl + '2' ) ).to.equal( false );
		} );
	} );
} );
