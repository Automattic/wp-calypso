/**
 * External dependencies
 */
import sha1 from 'hash.js/lib/hash/sha/1';

/**
 * Internal dependencies
 */
import { getUnconnectedSiteUser } from 'state/selectors';

describe( '#getUnconnectedSiteUser()', () => {
	const hash = sha1();
	const userEmail = 'contact@yourgroovydomain.com';
	hash.update( userEmail );
	const userEmailHashed = hash.digest( 'hex' );

	const credentials = {
		2916284: {
			token: 'abcd1234',
			siteUrl: 'http://yourgroovydomain.com',
			userEmail: userEmail,
		},
	};

	test( 'should return null if we have no credentials at all', () => {
		const selected = getUnconnectedSiteUser( {
			jetpackOnboarding: {
				credentials: {},
			},
		}, 12345678 );

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no credentials for the current site ID', () => {
		const selected = getUnconnectedSiteUser( {
			jetpackOnboarding: {
				credentials,
			},
		}, 12345678 );

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no userEmail in the credentials of the current site ID', () => {
		const selected = getUnconnectedSiteUser( {
			jetpackOnboarding: {
				credentials: {
					2916284: {
						token: 'abcd1234',
						siteUrl: 'http://yourgroovydomain.com',
					},
				},
			},
		}, 2916284 );

		expect( selected ).toBeNull();
	} );

	test( 'should return the userEmail if specified', () => {
		const selected = getUnconnectedSiteUser( {
			jetpackOnboarding: {
				credentials,
			},
		}, 2916284 );

		expect( selected ).toBe( userEmailHashed );
	} );
} );
