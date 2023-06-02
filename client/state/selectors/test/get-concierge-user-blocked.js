import getConciergeUserBlocked from 'calypso/state/selectors/get-concierge-user-blocked';

describe( 'getConciergeUserBlocked()', () => {
	test( 'should default to null', () => {
		expect( getConciergeUserBlocked( {} ) ).toBeNull();
	} );

	test( "should return the user's blocked status in the state,", () => {
		const isUserBlocked = true;

		expect(
			getConciergeUserBlocked( {
				concierge: {
					isUserBlocked,
				},
			} )
		).toEqual( isUserBlocked );
	} );
} );
