import { formatDate } from '../additional-terms-of-service-in-cart';

describe( 'formatDate', () => {
	const originalTZ = process.env.TZ;

	beforeAll( () => {
		// Simulate a UTC-5 timezone so tests catch the off-by-one that affects
		// users behind UTC: Date.parse("2026-06-17") returns UTC midnight, which
		// toLocaleDateString() would render as June 16 here.
		process.env.TZ = 'America/New_York';
	} );

	afterAll( () => {
		if ( originalTZ === undefined ) {
			delete process.env.TZ;
		} else {
			process.env.TZ = originalTZ;
		}
	} );

	it( 'formats a bare date string to the correct calendar date', () => {
		expect( formatDate( '2026-06-17' ) ).toBe( 'Jun 17, 2026' );
	} );

	it( 'formats a date at the start of a month correctly', () => {
		expect( formatDate( '2026-01-01' ) ).toBe( 'Jan 1, 2026' );
	} );

	it( 'formats a date at the end of a month correctly', () => {
		expect( formatDate( '2026-12-31' ) ).toBe( 'Dec 31, 2026' );
	} );

	it( 'does not shift the date when the string includes a UTC midnight timestamp', () => {
		// API responses may include a time component; UTC midnight is the worst
		// case for UTC- timezones.
		expect( formatDate( '2026-06-17T00:00:00.000Z' ) ).toBe( 'Jun 17, 2026' );
	} );
} );
