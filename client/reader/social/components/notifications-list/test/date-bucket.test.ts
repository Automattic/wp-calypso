import { bucketFor } from '../date-bucket';

function makeNow( iso: string ): Date {
	return new Date( iso );
}

describe( 'bucketFor', () => {
	const now = makeNow( '2026-05-12T15:30:00Z' );

	it( 'returns "today" for timestamps after start-of-today UTC', () => {
		expect( bucketFor( '2026-05-12T00:00:01Z', now ) ).toBe( 'today' );
		expect( bucketFor( '2026-05-12T14:00:00Z', now ) ).toBe( 'today' );
	} );

	it( 'returns "yesterday" for timestamps in the previous calendar day', () => {
		expect( bucketFor( '2026-05-11T23:59:59Z', now ) ).toBe( 'yesterday' );
		expect( bucketFor( '2026-05-11T00:00:01Z', now ) ).toBe( 'yesterday' );
	} );

	it( 'returns "this_week" for timestamps within last 7 days but before yesterday', () => {
		expect( bucketFor( '2026-05-10T12:00:00Z', now ) ).toBe( 'this_week' );
		expect( bucketFor( '2026-05-05T15:31:00Z', now ) ).toBe( 'this_week' );
	} );

	it( 'returns "earlier" for timestamps older than 7 days', () => {
		expect( bucketFor( '2026-05-05T15:29:00Z', now ) ).toBe( 'earlier' );
		expect( bucketFor( '2026-01-01T00:00:00Z', now ) ).toBe( 'earlier' );
	} );

	it( 'handles exactly start-of-today', () => {
		expect( bucketFor( '2026-05-12T00:00:00Z', now ) ).toBe( 'today' );
	} );

	it( 'handles exactly 7 days ago', () => {
		expect( bucketFor( '2026-05-05T15:30:00Z', now ) ).toBe( 'this_week' );
	} );

	it( 'handles invalid date by returning "earlier"', () => {
		expect( bucketFor( 'not-a-date', now ) ).toBe( 'earlier' );
	} );
} );
