/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPosterUrl from 'calypso/state/selectors/get-poster-url';

describe( 'getPosterUrl()', () => {
	test( 'should return the current video editor poster', () => {
		const url = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';
		const poster = getPosterUrl( {
			editor: {
				videoEditor: {
					url,
				},
			},
		} );

		expect( poster ).to.eql( url );
	} );
} );
