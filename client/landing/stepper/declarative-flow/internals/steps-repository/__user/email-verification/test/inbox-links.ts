import { getInboxLink } from '../inbox-links';

describe( 'getInboxLink', () => {
	it( 'matches a provider across its country domains', () => {
		expect( getInboxLink( 'a@hotmail.co.uk' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@outlook.com.br' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@live.fr' )?.provider ).toBe( 'outlook' );
		expect( getInboxLink( 'a@yahoo.de' )?.provider ).toBe( 'yahoo' );
		expect( getInboxLink( 'a@ymail.com' )?.provider ).toBe( 'yahoo' );
		expect( getInboxLink( 'a@aol.co.uk' )?.provider ).toBe( 'aol' );
	} );

	it( 'sends Yahoo Japan to its own mailbox rather than the brand default', () => {
		expect( getInboxLink( 'a@yahoo.co.jp' )?.url ).toBe( 'https://mail.yahoo.co.jp/' );
		expect( getInboxLink( 'a@yahoo.com' )?.url ).toBe( 'https://mail.yahoo.com/' );
	} );

	it( 'does not take a host that merely starts with a brand for that provider', () => {
		expect( getInboxLink( 'a@live.somecompany.com' ) ).toBeNull();
		expect( getInboxLink( 'a@outlook.internal.example.org' ) ).toBeNull();
	} );

	it( 'returns null for a self-hosted domain and for no address at all', () => {
		expect( getInboxLink( 'a@example.com' ) ).toBeNull();
		expect( getInboxLink( undefined ) ).toBeNull();
	} );
} );
