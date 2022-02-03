import { expect } from 'chai';
import { getThumbnailForIframe } from '../selectors';

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
} );
