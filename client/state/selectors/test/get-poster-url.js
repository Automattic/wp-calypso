/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPosterUrl } from 'client/state/selectors';

describe( 'getPosterUrl()', () => {
	test( 'should return the current video editor poster', () => {
		const url = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';
		const poster = getPosterUrl( {
			ui: {
				editor: {
					videoEditor: {
						url,
					},
				},
			},
		} );

		expect( poster ).to.eql( url );
	} );
} );
