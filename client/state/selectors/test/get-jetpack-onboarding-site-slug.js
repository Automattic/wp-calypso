/**
 * Internal dependencies
 */
import { getJetpackOnboardingSiteSlug } from 'state/selectors';

describe( '#getJetpackOnboardingSiteSlug()', () => {
	test( 'should return null if no site is in the Jetpack Onboarding flow', () => {
		const selected = getJetpackOnboardingSiteSlug( {
			ui: {
				jetpackOnboardingSiteId: null,
			},
		} );

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no credentials for the current siteId', () => {
		const selected = getJetpackOnboardingSiteSlug( {
			jetpackOnboarding: {
				credentials: {},
			},
			ui: {
				jetpackOnboardingSiteId: 2916284,
			},
		} );

		expect( selected ).toBeNull();
	} );

	test( 'should return the site slug of the site', () => {
		const selected = getJetpackOnboardingSiteSlug( {
			jetpackOnboarding: {
				credentials: {
					2916284: {
						token: 'abcd1234',
						siteUrl: 'http://yourgroovydomain.com',
						userEmail: 'contact@yourgroovydomain.com',
					},
				},
			},
			ui: {
				jetpackOnboardingSiteId: 2916284,
			},
		} );

		expect( selected ).toBe( 'yourgroovydomain.com' );
	} );

	test( 'should escape slashes in the site slug of the site', () => {
		const selected = getJetpackOnboardingSiteSlug( {
			jetpackOnboarding: {
				credentials: {
					2916284: {
						token: 'abcd1234',
						siteUrl: 'http://yourgroovydomain.com/wordpress',
						userEmail: 'contact@yourgroovydomain.com',
					},
				},
			},
			ui: {
				jetpackOnboardingSiteId: 2916284,
			},
		} );

		expect( selected ).toBe( 'yourgroovydomain.com::wordpress' );
	} );
} );
