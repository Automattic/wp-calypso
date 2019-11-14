/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getOAuth2Client } from '../selectors';

describe( 'selectors', () => {
	describe( 'getOAuth2Client()', () => {
		test( 'should return null if no state provided', () => {
			const client = getOAuth2Client();

			expect( client ).to.be.null;
		} );

		test( 'should return null if wrong client id provided', () => {
			const client = getOAuth2Client(
				{
					oauth2Clients: {
						1: {
							id: 1,
							name: 'test',
							title: 'WordPress.com Test Client',
							url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
						},
					},
				},
				2
			);

			expect( client ).to.be.null;
		} );

		test( 'should return data', () => {
			const client = getOAuth2Client(
				{
					oauth2Clients: {
						1: {
							id: 1,
							name: 'test',
							title: 'WordPress.com Test Client',
							url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
						},
					},
				},
				1
			);

			expect( client ).to.deep.equal( {
				id: 1,
				name: 'test',
				title: 'WordPress.com Test Client',
				url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
			} );
		} );
	} );
} );
