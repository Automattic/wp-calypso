/** @format */

/**
 * Internal dependencies
 */
import getJpoUserHash from 'state/selectors/get-jpo-user-hash';

describe( '#getJpoUserHash()', () => {
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
	const emptyCurrentUserState = {
		currentUser: {},
		users: {
			items: {},
		},
	};
	const currentUserState = {
		currentUser: {
			id: 123456,
		},
		users: {
			items: {
				123456: {
					ID: 123456,
					email: userEmail,
				},
			},
		},
	};

	test( 'should return null if we have no credentials and no current user', () => {
		const selected = getJpoUserHash(
			{
				jetpack: {
					onboarding: {
						credentials: {},
					},
				},
				...emptyCurrentUserState,
			},
			12345678
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no credentials for the current site ID, and no current user', () => {
		const selected = getJpoUserHash(
			{
				jetpack: {
					onboarding: {
						credentials,
					},
				},
				...emptyCurrentUserState,
			},
			12345678
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no userEmail in the credentials of the current site and no current user', () => {
		const selected = getJpoUserHash(
			{
				jetpack: {
					onboarding: {
						credentials: {
							2916284: {
								token: 'abcd1234',
								siteUrl: 'http://yourgroovydomain.com',
							},
						},
					},
				},
				...emptyCurrentUserState,
			},
			2916284
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return hashed userEmail if it exists in the onboarding credentials', () => {
		const selected = getJpoUserHash(
			{
				jetpack: {
					onboarding: {
						credentials,
					},
				},
				...emptyCurrentUserState,
			},
			2916284
		);

		expect( selected ).toBe( userEmailHashed );
	} );

	test( 'should return hashed userEmail if current user is known', () => {
		const selected = getJpoUserHash(
			{
				jetpack: {
					onboarding: {
						credentials: {},
					},
				},
				...currentUserState,
			},
			2916284
		);

		expect( selected ).toBe( userEmailHashed );
	} );
} );
