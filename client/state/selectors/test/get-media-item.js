/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getMediaItem from 'state/selectors/get-media-item';
import MediaQueryManager from 'lib/query-manager/media';

describe( 'getMediaItem()', () => {
	const item = {
		ID: 42,
		title: 'flowers',
		URL: 'https://hello.com',
	};

	const state = {
		media: {
			queries: {
				2916284: new MediaQueryManager( {
					items: {
						42: item,
					},
				} ),
			},
		},
	};

	test( 'should return null if the site is not in state', () => {
		expect( getMediaItem( state, 2916285, 42 ) ).to.be.null;
	} );

	test( 'should return null if the media for the site is not in state', () => {
		expect( getMediaItem( state, 2916284, 43 ) ).to.be.null;
	} );

	test( 'should return the media item', () => {
		expect( getMediaItem( state, 2916284, 42 ) ).to.eql( item );
	} );
} );
