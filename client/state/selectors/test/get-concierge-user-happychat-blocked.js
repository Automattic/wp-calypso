import getConciergeHappychatBlocked from 'calypso/state/selectors/get-concierge-user-happychat-blocked';

describe( 'getConciergeHappychatBlocked()', () => {
	test( 'should default to null', () => {
		expect( getConciergeHappychatBlocked( {} ) ).toBeNull();
	} );

	test( 'should return the happy chat blocked status in the state,', () => {
		const isHappychatBlocked = true;

		expect(
			getConciergeHappychatBlocked( {
				concierge: {
					isHappychatBlocked,
				},
			} )
		).toEqual( isHappychatBlocked );
	} );
} );
