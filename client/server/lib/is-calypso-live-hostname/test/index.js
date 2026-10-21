import isCalypsoLiveHostname from '..';

describe( 'isCalypsoLiveHostname', () => {
	it( 'returns true for calypso.live and its containers', () => {
		expect( isCalypsoLiveHostname( 'calypso.live' ) ).toBe( true );
		expect( isCalypsoLiveHostname( 'hash-abcd1234.calypso.live' ) ).toBe( true );
		expect( isCalypsoLiveHostname( 'hash-abcd1234-a4a.calypso.live' ) ).toBe( true );
	} );

	it( 'returns false for other hostnames', () => {
		expect( isCalypsoLiveHostname( undefined ) ).toBe( false );
		expect( isCalypsoLiveHostname( 'wpcalypso.wordpress.com' ) ).toBe( false );
		expect( isCalypsoLiveHostname( 'calypso.live.com' ) ).toBe( false );
		expect( isCalypsoLiveHostname( 'a.b.calypso.live' ) ).toBe( false );
	} );
} );
