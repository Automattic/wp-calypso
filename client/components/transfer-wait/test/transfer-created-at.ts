import { parseTransferCreatedAt } from '../transfer-created-at';

describe( 'parseTransferCreatedAt', () => {
	test( 'reads the endpoint’s timezone-naive format as UTC', () => {
		expect( parseTransferCreatedAt( '2026-08-12 13:11:10' ) ).toBe(
			Date.UTC( 2026, 7, 12, 13, 11, 10 )
		);
	} );

	test( 'is unaffected by the local timezone', () => {
		// Date.parse would read the naive format in the runner's local zone; the UTC
		// anchor must not move with it.
		expect( parseTransferCreatedAt( '2026-08-12 13:11:10' ) ).toBe(
			Date.parse( '2026-08-12T13:11:10Z' )
		);
	} );

	test( 'leaves a timestamp that declares its zone alone', () => {
		expect( parseTransferCreatedAt( '2026-08-12T13:11:10+02:00' ) ).toBe(
			Date.parse( '2026-08-12T13:11:10+02:00' )
		);
		expect( parseTransferCreatedAt( '2026-08-12T13:11:10Z' ) ).toBe(
			Date.parse( '2026-08-12T13:11:10Z' )
		);
	} );

	test( 'reads a negative offset as declared', () => {
		expect( parseTransferCreatedAt( '2026-08-12T13:11:10-07:00' ) ).toBe(
			Date.parse( '2026-08-12T13:11:10-07:00' )
		);
	} );

	test( 'returns NaN for an unparseable value', () => {
		expect( parseTransferCreatedAt( 'not-a-date' ) ).toBeNaN();
		expect( parseTransferCreatedAt( '' ) ).toBeNaN();
		expect( parseTransferCreatedAt( '2026-13-40 99:99:99' ) ).toBeNaN();
	} );
} );
