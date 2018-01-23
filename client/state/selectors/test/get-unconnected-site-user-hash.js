/**
 * Internal dependencies
 */
import { getUnconnectedSiteUserHash } from 'state/selectors';

describe( '#getUnconnectedSiteUserHash()', () => {
	const userEmail = 'contact@yourgroovydomain.com';
	// sha1 hash of the userEmail
	const userEmailHashed = 'c71a8fb1da35d12dbc14ae2a49d67460b3975fe6';

	const credentials = {
		2916284: {
			token: 'abcd1234',
			siteUrl: 'http://yourgroovydomain.com',
			userEmail,
		},
	};

	test( 'should return null if we have no credentials at all', () => {
		const selected = getUnconnectedSiteUserHash( {
			jetpackOnboarding: {
				credentials: {},
			},
		}, 12345678 );

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no credentials for the current site ID', () => {
		const selected = getUnconnectedSiteUserHash( {
			jetpackOnboarding: {
				credentials,
			},
		}, 12345678 );

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no userEmail in the credentials of the current site ID', () => {
		const selected = getUnconnectedSiteUserHash( {
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

	test( 'should return hashed userEmail if specified', () => {
		const selected = getUnconnectedSiteUserHash( {
			jetpackOnboarding: {
				credentials,
			},
		}, 2916284 );

		expect( selected ).toBe( userEmailHashed );
	} );
} );
