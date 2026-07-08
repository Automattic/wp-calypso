import {
	isIosOAuth2Client,
	isAndroidOAuth2Client,
	isSharedMobileAppOAuth2Client,
	getOAuth2RedirectUri,
	isJetpackAppRedirectUri,
} from 'calypso/lib/oauth2-clients';

describe( 'oauth2-clients mobile app helpers', () => {
	describe( 'isIosOAuth2Client', () => {
		test( 'matches the production and beta/alpha/trial iOS client IDs', () => {
			expect( isIosOAuth2Client( { id: 11 } ) ).toBe( true );
			expect( isIosOAuth2Client( { id: 29217 } ) ).toBe( true );
			expect( isIosOAuth2Client( { id: 36118 } ) ).toBe( true );
			expect( isIosOAuth2Client( { id: 55461 } ) ).toBe( true );
		} );

		test( 'does not match Android or unrelated clients', () => {
			expect( isIosOAuth2Client( { id: 2697 } ) ).toBe( false );
			expect( isIosOAuth2Client( { id: 1854 } ) ).toBe( false );
			expect( isIosOAuth2Client( null ) ).toBe( false );
			expect( isIosOAuth2Client( undefined ) ).toBe( false );
		} );
	} );

	describe( 'isAndroidOAuth2Client', () => {
		test( 'matches the production and trial Android client IDs', () => {
			expect( isAndroidOAuth2Client( { id: 2697 } ) ).toBe( true );
			expect( isAndroidOAuth2Client( { id: 55462 } ) ).toBe( true );
		} );

		test( 'does not match iOS or unrelated clients', () => {
			expect( isAndroidOAuth2Client( { id: 11 } ) ).toBe( false );
			expect( isAndroidOAuth2Client( { id: 1854 } ) ).toBe( false );
			expect( isAndroidOAuth2Client( null ) ).toBe( false );
		} );
	} );

	describe( 'isSharedMobileAppOAuth2Client', () => {
		test( 'matches any shared mobile app client on either platform', () => {
			expect( isSharedMobileAppOAuth2Client( { id: 11 } ) ).toBe( true );
			expect( isSharedMobileAppOAuth2Client( { id: 2697 } ) ).toBe( true );
			expect( isSharedMobileAppOAuth2Client( { id: 29217 } ) ).toBe( true );
			expect( isSharedMobileAppOAuth2Client( { id: 55462 } ) ).toBe( true );
		} );

		test( 'does not match non-mobile clients', () => {
			expect( isSharedMobileAppOAuth2Client( { id: 1854 } ) ).toBe( false );
			expect( isSharedMobileAppOAuth2Client( { id: 68663 } ) ).toBe( false );
			expect( isSharedMobileAppOAuth2Client( null ) ).toBe( false );
		} );
	} );

	describe( 'getOAuth2RedirectUri', () => {
		test( 'extracts redirect_uri nested inside redirect_to', () => {
			const query = {
				redirect_to:
					'https://public-api.wordpress.com/oauth2/authorize?client_id=11&response_type=code&redirect_uri=jetpack%3A%2F%2Foauth2-callback',
			};
			expect( getOAuth2RedirectUri( query ) ).toBe( 'jetpack://oauth2-callback' );
		} );

		test( 'prefers a direct redirect_uri query param when present', () => {
			const query = { redirect_uri: 'wordpress://oauth2-callback', redirect_to: 'https://x/?y=1' };
			expect( getOAuth2RedirectUri( query ) ).toBe( 'wordpress://oauth2-callback' );
		} );

		test( 'returns null when neither is present', () => {
			expect( getOAuth2RedirectUri( { from: 'jetpack' } ) ).toBeNull();
			expect( getOAuth2RedirectUri( null ) ).toBeNull();
		} );
	} );

	describe( 'isJetpackAppRedirectUri', () => {
		test( 'is true for the jetpack:// scheme, case-insensitively', () => {
			expect( isJetpackAppRedirectUri( 'jetpack://oauth2-callback' ) ).toBe( true );
			expect( isJetpackAppRedirectUri( 'jetpack://wpcom-authorize' ) ).toBe( true );
			expect( isJetpackAppRedirectUri( 'JETPACK://oauth2-callback' ) ).toBe( true );
		} );

		test( 'is true even when singly or multiply percent-encoded', () => {
			expect( isJetpackAppRedirectUri( 'jetpack%3A%2F%2Foauth2-callback' ) ).toBe( true );
			expect( isJetpackAppRedirectUri( 'jetpack%253A%252F%252Foauth2-callback' ) ).toBe( true );
		} );

		test( 'is false for the wordpress:// scheme and empty values', () => {
			expect( isJetpackAppRedirectUri( 'wordpress://oauth2-callback' ) ).toBe( false );
			expect( isJetpackAppRedirectUri( '' ) ).toBe( false );
			expect( isJetpackAppRedirectUri( null ) ).toBe( false );
			expect( isJetpackAppRedirectUri( undefined ) ).toBe( false );
		} );
	} );
} );
