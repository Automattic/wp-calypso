/** @format */

/**
 * Internal dependencies
 */
import getUnconnectedSite from 'state/selectors/get-unconnected-site';

describe( '#getUnconnectedSite()', () => {
	const site = {
		token: 'abcd1234',
		siteUrl: 'http://yourgroovydomain.com',
		userEmail: 'contact@yourgroovydomain.com',
	};
	const credentials = {
		2916284: site,
	};

	test( 'should return null if we have no credentials at all', () => {
		const selected = getUnconnectedSite(
			{
				jetpack: {
					onboarding: {
						credentials: {},
					},
				},
			},
			12345678
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no credentials for the current site ID', () => {
		const selected = getUnconnectedSite(
			{
				jetpack: {
					onboarding: {
						credentials,
					},
				},
			},
			12345678
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return the site credentials of a known unconnected site', () => {
		const selected = getUnconnectedSite(
			{
				jetpack: {
					onboarding: {
						credentials,
					},
				},
			},
			2916284
		);

		expect( selected ).toBe( site );
	} );
} );
