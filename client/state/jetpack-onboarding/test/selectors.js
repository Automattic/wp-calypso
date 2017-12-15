/**
 * Internal dependencies
 */
import { getUnconnectedSiteIdForSlug } from '../selectors';

describe( '#getUnconnectedSiteIdForSlug()', () => {
	test( 'should return null if we have no credentials for the current site slug', () => {
		const selected = getUnconnectedSiteIdForSlug( {
			jetpackOnboarding: {
				credentials: {},
			},
		}, 'yourgroovydomain.com' );

		expect( selected ).toBeNull();
	} );

	test( 'should return the site ID of the site', () => {
		const selected = getUnconnectedSiteIdForSlug( {
			jetpackOnboarding: {
				credentials: {
					2916284: {
						token: 'abcd1234',
						siteUrl: 'http://yourgroovydomain.com',
						userEmail: 'contact@yourgroovydomain.com',
					},
				},
			},
		}, 'yourgroovydomain.com' );

		expect( selected ).toBe( 2916284 );
	} );

	test( 'should return the site ID of the site for a subdir install', () => {
		const selected = getUnconnectedSiteIdForSlug( {
			jetpackOnboarding: {
				credentials: {
					2916284: {
						token: 'abcd1234',
						siteUrl: 'http://yourgroovydomain.com/wordpress',
						userEmail: 'contact@yourgroovydomain.com',
					},
				},
			},
		}, 'yourgroovydomain.com::wordpress' );

		expect( selected ).toBe( 2916284 );
	} );
} );
