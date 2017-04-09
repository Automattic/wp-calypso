/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingMedia } from '../';
import MediaQueryManager from 'lib/query-manager/media';

describe( 'isRequestingMedia()', () => {
	const query = {
		search: 'flower'
	};

	const state = {
		media: {
			queryRequests: {
				2916284: {
					[ MediaQueryManager.QueryKey.stringify( query ) ]: true
				}
			}
		}
	};

	it( 'should return false if the site is not attached', () => {
		const isRequesting = isRequestingMedia( state, 2916285, query );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return false if media are not being requested', () => {
		const isRequesting = isRequestingMedia( state, 2916284, {
			search: 'flowers'
		} );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return true if media are being requested', () => {
		const isRequesting = isRequestingMedia( state, 2916284, query );

		expect( isRequesting ).to.be.true;
	} );
} );
