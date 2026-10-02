import getIsJetpackApp from 'calypso/state/selectors/get-is-jetpack-app';

const buildState = ( { clientId, redirectTo, oauth2Redirect, initialRedirectTo } ) => ( {
	oauth2Clients: {
		ui: { currentClientId: clientId ?? null },
		clients: clientId ? { [ clientId ]: { id: clientId } } : {},
	},
	route: {
		query: {
			current: {
				...( clientId ? { client_id: String( clientId ) } : {} ),
				...( redirectTo ? { redirect_to: redirectTo } : {} ),
				...( oauth2Redirect ? { oauth2_redirect: oauth2Redirect } : {} ),
			},
			...( initialRedirectTo
				? { initial: { client_id: String( clientId ), redirect_to: initialRedirectTo } }
				: {} ),
		},
	},
} );

const authorizeUrl = ( { clientId, redirectUri } ) =>
	`https://public-api.wordpress.com/oauth2/authorize?client_id=${ clientId }&response_type=code&redirect_uri=${ redirectUri }`;

describe( 'getIsJetpackApp', () => {
	test( 'is true for an iOS shared mobile client with a jetpack:// redirect_uri', () => {
		const state = buildState( {
			clientId: 11,
			redirectTo: authorizeUrl( { clientId: 11, redirectUri: 'jetpack%3A%2F%2Foauth2-callback' } ),
		} );
		expect( getIsJetpackApp( state ) ).toBe( true );
	} );

	test( 'is false for an iOS shared mobile client with a wordpress:// redirect_uri', () => {
		const state = buildState( {
			clientId: 11,
			redirectTo: authorizeUrl( {
				clientId: 11,
				redirectUri: 'wordpress%3A%2F%2Foauth2-callback',
			} ),
		} );
		expect( getIsJetpackApp( state ) ).toBe( false );
	} );

	test( 'is true for an Android shared mobile client with a double-encoded jetpack:// redirect_uri', () => {
		const state = buildState( {
			clientId: 2697,
			redirectTo: authorizeUrl( {
				clientId: 2697,
				redirectUri: 'jetpack%253A%252F%252Fwpcom-authorize',
			} ),
		} );
		expect( getIsJetpackApp( state ) ).toBe( true );
	} );

	test( 'is false for a non-mobile client even with a jetpack:// redirect_uri', () => {
		const state = buildState( {
			clientId: 1854,
			redirectTo: authorizeUrl( {
				clientId: 1854,
				redirectUri: 'jetpack%3A%2F%2Foauth2-callback',
			} ),
		} );
		expect( getIsJetpackApp( state ) ).toBe( false );
	} );

	test( 'is false for a shared mobile client with no redirect', () => {
		expect( getIsJetpackApp( buildState( { clientId: 11 } ) ) ).toBe( false );
	} );

	test( 'falls back to the initial redirect_uri when the 2FA route drops it from the current query', () => {
		// 2FA sub-routes (e.g. /log-in/webauthn) navigate away from the launching URL,
		// so the current query keeps the sticky client_id but loses the jetpack:// redirect.
		const state = buildState( {
			clientId: 11,
			initialRedirectTo: authorizeUrl( {
				clientId: 11,
				redirectUri: 'jetpack%3A%2F%2Foauth2-callback',
			} ),
		} );
		expect( getIsJetpackApp( state ) ).toBe( true );
	} );

	test( 'is true on the signup page, where the redirect_uri is nested inside oauth2_redirect', () => {
		// getSignupUrl sends OAuth2 clients to /start/wpcc?oauth2_client_id=…&oauth2_redirect=<login redirect_to>.
		const state = buildState( {
			clientId: 11,
			oauth2Redirect: authorizeUrl( {
				clientId: 11,
				redirectUri: 'jetpack%3A%2F%2Foauth2-callback',
			} ),
		} );
		expect( getIsJetpackApp( state ) ).toBe( true );
	} );

	test( 'is false on the signup page for the WordPress app', () => {
		const state = buildState( {
			clientId: 2697,
			oauth2Redirect: authorizeUrl( {
				clientId: 2697,
				redirectUri: 'wordpress%3A%2F%2Foauth2-callback',
			} ),
		} );
		expect( getIsJetpackApp( state ) ).toBe( false );
	} );

	test( 'is false when there is no current OAuth2 client', () => {
		expect( getIsJetpackApp( buildState( {} ) ) ).toBe( false );
	} );
} );
