import { isWordCampSignupActive } from '../wordcamp-signup-campaign';

describe( 'isWordCampSignupActive', () => {
	it.each( [
		[ 'before the event', '2026-08-16T06:59:59.999Z', false ],
		[ 'when the event starts', '2026-08-16T07:00:00Z', true ],
		[ 'during the event', '2026-08-20T06:59:59.999Z', true ],
		[ 'when the event ends', '2026-08-20T07:00:00Z', false ],
	] )( 'returns the expected value %s', ( _description, now, expected ) => {
		expect( isWordCampSignupActive( Date.parse( now ) ) ).toBe( expected );
	} );
} );
