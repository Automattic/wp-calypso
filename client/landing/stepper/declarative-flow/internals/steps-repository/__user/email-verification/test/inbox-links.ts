import { getInboxLink } from '../inbox-links';

describe( 'getInboxLink', () => {
	it( 'matches a provider across the country domains it runs', () => {
		expect( getInboxLink( 'a@hotmail.co.uk' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@live.fr' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@yahoo.de' )?.provider ).toBe( 'yahoo' );
		expect( getInboxLink( 'a@ymail.com' )?.provider ).toBe( 'yahoo' );
	} );

	it( 'sends Yahoo Japan to its own mailbox rather than the shared one', () => {
		expect( getInboxLink( 'a@yahoo.co.jp' )?.url ).toBe( 'https://mail.yahoo.co.jp/' );
		expect( getInboxLink( 'a@yahoo.com' )?.url ).toBe( 'https://mail.yahoo.com/' );
	} );

	// A brand in the name says nothing about who runs the mail, and a domain a provider once ran
	// may since have been parked. Either way a wrong link is worse than none: hotmail.com.mx and
	// live.pt publish no working MX, and live.io is Google-hosted.
	it( 'does not claim a domain the provider does not run mail for', () => {
		expect( getInboxLink( 'a@live.io' ) ).toBeNull();
		expect( getInboxLink( 'a@hotmail.com.mx' ) ).toBeNull();
		expect( getInboxLink( 'a@live.pt' ) ).toBeNull();
		expect( getInboxLink( 'a@outlook.somecompany.com' ) ).toBeNull();
		expect( getInboxLink( 'a@gmail.io' ) ).toBeNull();
	} );

	it( 'returns null for a self-hosted domain and for no address at all', () => {
		expect( getInboxLink( 'a@example.com' ) ).toBeNull();
		expect( getInboxLink( undefined ) ).toBeNull();
	} );
} );
