/**
 * Internal dependencies
 */
import getUnconnectedSiteUrl from 'state/selectors/get-unconnected-site-url';

describe( '#getUnconnectedSiteUrl()', () => {
	const credentials = {
		2916284: {
			token: 'abcd1234',
			siteUrl: 'http://yourgroovydomain.com',
			userEmail: 'contact@yourgroovydomain.com',
		},
	};

	test( 'should return null if we have no credentials at all', () => {
		const selected = getUnconnectedSiteUrl(
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
		const selected = getUnconnectedSiteUrl(
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

	test( 'should return null if we have no siteUrl in the credentials of the current site ID', () => {
		const selected = getUnconnectedSiteUrl(
			{
				jetpack: {
					onboarding: {
						credentials: {
							2916284: {
								token: 'abcd1234',
								userEmail: 'contact@yourgroovydomain.com',
							},
						},
					},
				},
			},
			2916284
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return the site URL of a known unconnected site', () => {
		const selected = getUnconnectedSiteUrl(
			{
				jetpack: {
					onboarding: {
						credentials,
					},
				},
			},
			2916284
		);

		expect( selected ).toBe( 'http://yourgroovydomain.com' );
	} );
} );
