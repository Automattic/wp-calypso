/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingMediaItem from 'calypso/state/selectors/is-requesting-media-item';

describe( 'isRequestingMediaItem()', () => {
	const state = {
		media: {
			fetching: {
				2916284: {
					items: {
						10: true,
					},
				},
			},
		},
	};

	test( 'should return false if the site is not attached', () => {
		const isRequesting = isRequestingMediaItem( state, 2916285, 10 );

		expect( isRequesting ).to.be.false;
	} );

	test( 'should return false if media are not being requested', () => {
		const isRequesting = isRequestingMediaItem( state, 2916284, 20 );

		expect( isRequesting ).to.be.false;
	} );

	test( 'should return true if media are being requested', () => {
		const isRequesting = isRequestingMediaItem( state, 2916284, 10 );

		expect( isRequesting ).to.be.true;
	} );
} );
