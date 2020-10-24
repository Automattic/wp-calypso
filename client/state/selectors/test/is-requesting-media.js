/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingMedia from 'calypso/state/selectors/is-requesting-media';
import MediaQueryManager from 'calypso/lib/query-manager/media';

describe( 'isRequestingMedia()', () => {
	const query = {
		search: 'flower',
	};

	const state = {
		media: {
			queryRequests: {
				2916284: {
					[ MediaQueryManager.QueryKey.stringify( query ) ]: true,
				},
			},
		},
	};

	test( 'should return false if the site is not attached', () => {
		const isRequesting = isRequestingMedia( state, 2916285, query );

		expect( isRequesting ).to.be.false;
	} );

	test( 'should return false if media are not being requested', () => {
		const isRequesting = isRequestingMedia( state, 2916284, {
			search: 'flowers',
		} );

		expect( isRequesting ).to.be.false;
	} );

	test( 'should return true if media are being requested', () => {
		const isRequesting = isRequestingMedia( state, 2916284, query );

		expect( isRequesting ).to.be.true;
	} );
} );
