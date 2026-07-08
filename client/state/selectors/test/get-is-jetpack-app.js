import getIsJetpackApp from 'calypso/state/selectors/get-is-jetpack-app';

const buildState = ( { clientId, redirectTo } ) => ( {
	oauth2Clients: {
		ui: { currentClientId: clientId ?? null },
		clients: clientId ? { [ clientId ]: { id: clientId } } : {},
	},
	route: {
		query: {
			current: {
				...( clientId ? { client_id: String( clientId ) } : {} ),
				...( redirectTo ? { redirect_to: redirectTo } : {} ),
			},
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

	test( 'is false when there is no current OAuth2 client', () => {
		expect( getIsJetpackApp( buildState( {} ) ) ).toBe( false );
	} );
} );
