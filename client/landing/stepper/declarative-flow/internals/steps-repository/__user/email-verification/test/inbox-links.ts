import { getInboxLink } from '../inbox-links';

describe( 'getInboxLink', () => {
	it( 'matches a provider across the country domains it runs', () => {
		expect( getInboxLink( 'a@hotmail.co.uk' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@outlook.com.br' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@live.fr' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@yahoo.de' )?.provider ).toBe( 'yahoo' );
		expect( getInboxLink( 'a@ymail.com' )?.provider ).toBe( 'yahoo' );
		expect( getInboxLink( 'a@aol.co.uk' )?.provider ).toBe( 'aol' );
	} );

	it( 'sends Yahoo Japan to its own mailbox rather than the shared one', () => {
		expect( getInboxLink( 'a@yahoo.co.jp' )?.url ).toBe( 'https://mail.yahoo.co.jp/' );
		expect( getInboxLink( 'a@yahoo.com' )?.url ).toBe( 'https://mail.yahoo.com/' );
	} );

	// A brand name in a domain says nothing about who runs its mail: live.io is Google-hosted,
	// and a link to Microsoft would be worse than the no link an unknown domain gets.
	it( 'does not claim a domain a provider does not run', () => {
		expect( getInboxLink( 'a@live.io' ) ).toBeNull();
		expect( getInboxLink( 'a@outlook.somecompany.com' ) ).toBeNull();
		expect( getInboxLink( 'a@gmail.io' ) ).toBeNull();
	} );

	it( 'returns null for a self-hosted domain and for no address at all', () => {
		expect( getInboxLink( 'a@example.com' ) ).toBeNull();
		expect( getInboxLink( undefined ) ).toBeNull();
	} );
} );
