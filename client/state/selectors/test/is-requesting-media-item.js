/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingMediaItem } from '../';

describe( 'isRequestingMediaItem()', () => {
	const state = {
		media: {
			mediaItemRequests: {
				2916284: {
					10: true
				}
			}
		}
	};

	it( 'should return false if the site is not attached', () => {
		const isRequesting = isRequestingMediaItem( state, 2916285, 10 );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return false if media are not being requested', () => {
		const isRequesting = isRequestingMediaItem( state, 2916284, 20 );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return true if media are being requested', () => {
		const isRequesting = isRequestingMediaItem( state, 2916284, 10 );

		expect( isRequesting ).to.be.true;
	} );
} );
