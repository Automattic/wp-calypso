import { buildEnterPasswordLoginParameters } from '../index.jsx';

const baseProps = {
	isJetpackLogin: false,
	locale: 'en',
	userEmail: 'user@example.com',
	query: {},
	twoFactorNotificationSent: 'none',
	redirectToOriginal: '/log-in',
	oauth2Client: { id: 123 },
};

describe( 'buildEnterPasswordLoginParameters', () => {
	it( 'omits usernameOnly when not forced and query lacks flag', () => {
		const result = buildEnterPasswordLoginParameters( baseProps );

		expect( result ).not.toHaveProperty( 'usernameOnly' );
		expect( result ).toMatchObject( {
			isJetpack: baseProps.isJetpackLogin,
			locale: baseProps.locale,
			emailAddress: baseProps.userEmail,
			redirectTo: baseProps.redirectToOriginal,
			oauth2ClientId: baseProps.oauth2Client.id,
		} );
	} );

	it( 'adds usernameOnly when query contains username_only flag', () => {
		const result = buildEnterPasswordLoginParameters( {
			...baseProps,
			query: { username_only: 'true' },
		} );

		expect( result.usernameOnly ).toBe( true );
	} );

	it( 'forces usernameOnly when option is provided', () => {
		const result = buildEnterPasswordLoginParameters( baseProps, { forceUsernameOnly: true } );

		expect( result.usernameOnly ).toBe( true );
	} );
} );
