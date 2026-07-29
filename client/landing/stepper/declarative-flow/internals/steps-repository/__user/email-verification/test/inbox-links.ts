import { getInboxLink } from '../inbox-links';

describe( 'getInboxLink', () => {
	it( 'maps a known provider to its inbox, pre-filtered to our sender', () => {
		const link = getInboxLink( 'someone@gmail.com' );
		expect( link?.providerName ).toBe( 'Gmail' );
		expect( link?.url ).toContain( 'mail.google.com' );
		expect( link?.url ).toContain( 'wordpress.com' );
	} );

	it( 'targets the signup mailbox by email so multi-account users land in the right inbox', () => {
		expect( getInboxLink( 'someone@gmail.com' )?.url ).toContain(
			'authuser=someone%40gmail.com'
		);
	} );

	it( 'matches the domain case-insensitively', () => {
		expect( getInboxLink( 'Someone@GMAIL.com' )?.providerName ).toBe( 'Gmail' );
	} );

	it( 'treats provider aliases as the same provider', () => {
		expect( getInboxLink( 'a@hotmail.com' )?.providerName ).toBe( 'Outlook' );
		expect( getInboxLink( 'a@live.com' )?.providerName ).toBe( 'Outlook' );
		expect( getInboxLink( 'a@me.com' )?.providerName ).toBe( 'iCloud Mail' );
	} );

	it( 'returns null for an unrecognized or self-hosted domain', () => {
		expect( getInboxLink( 'owner@example.com' ) ).toBeNull();
	} );

	it( 'returns null for a missing or malformed address', () => {
		expect( getInboxLink( undefined ) ).toBeNull();
		expect( getInboxLink( 'not-an-email' ) ).toBeNull();
	} );
} );
