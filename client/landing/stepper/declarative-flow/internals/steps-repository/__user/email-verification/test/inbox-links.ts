import { getInboxLink } from '../inbox-links';

describe( 'getInboxLink', () => {
	it( 'maps a known provider to its inbox, pre-filtered to our sender', () => {
		const link = getInboxLink( 'someone@gmail.com' );
		expect( link?.provider ).toBe( 'gmail' );
		expect( link?.url ).toContain( 'mail.google.com' );
		expect( link?.url ).toContain( 'wordpress.com' );
	} );

	it( 'targets the signup mailbox by email so multi-account users land in the right inbox', () => {
		expect( getInboxLink( 'someone@gmail.com' )?.url ).toContain( 'authuser=someone%40gmail.com' );
	} );

	it( 'returns null for an unrecognized or self-hosted domain', () => {
		expect( getInboxLink( 'owner@example.com' ) ).toBeNull();
	} );
} );
