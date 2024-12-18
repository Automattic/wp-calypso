import { calcMinutesToRead } from '../';

describe( 'lib/time-to-read/calcMinutesToRead', () => {
	test( 'should return correct reading time estimates', () => {
		const cases = [
			// [words, expected minutes]
			[ 0, 0 ],
			[ -10, 0 ],
			[ 100, 1 ],
			[ 189, 1 ], // exactly one minute at avg reading rate
			[ 190, 2 ], // just over one minute
			[ 500, 3 ],
			[ 1000, 6 ],
			[ null, 0 ],
			[ undefined, 0 ],
			[ NaN, 0 ],
		];

		cases.forEach( ( [ words, expected ] ) => {
			expect( calcMinutesToRead( words ) ).toBe( expected );
		} );
	} );

	test( 'should return 0 when no argument is provided', () => {
		expect( calcMinutesToRead() ).toBe( 0 );
	} );

	test( 'should always return at least 1 minute for valid positive input', () => {
		expect( calcMinutesToRead( 1 ) ).toBe( 1 );
		expect( calcMinutesToRead( 50 ) ).toBe( 1 );
		expect( calcMinutesToRead( 188 ) ).toBe( 1 );
	} );
} );
