/**
 * Internal dependencies
 */
import getConciergeAvailableTimes from 'calypso/state/selectors/get-concierge-available-times';

describe( 'getConciergeAvailableTimes()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeAvailableTimes( {} ) ).toBeNull();
	} );

	test( 'should return the items field under the concierge shift state tree.', () => {
		const availableTimes = [
			new Date( '2017-01-01 08:00:00' ),
			new Date( '2017-01-01 09:00:00' ),
			new Date( '2017-01-01 10:00:00' ),
		];
		const state = {
			concierge: {
				availableTimes,
			},
		};

		expect( getConciergeAvailableTimes( state ) ).toEqual( availableTimes );
	} );
} );
