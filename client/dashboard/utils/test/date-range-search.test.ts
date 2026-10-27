import { validateDateRangeSearch } from '../date-range-search';

const FROM = 1729987200; // Oct 27, 2024 00:00:00 UTC
const TO = 1730159999; // Oct 28, 2024 23:59:59 UTC

describe( 'validateDateRangeSearch', () => {
	test( 'converts millisecond params to seconds', () => {
		expect( validateDateRangeSearch( { from: FROM * 1000, to: TO * 1000 } ) ).toEqual( {
			from: FROM,
			to: TO,
		} );
	} );

	test( 'keeps second params unchanged', () => {
		expect( validateDateRangeSearch( { from: FROM, to: TO } ) ).toEqual( { from: FROM, to: TO } );
	} );

	test( 'drops a reversed range', () => {
		expect( validateDateRangeSearch( { from: TO * 1000, to: FROM * 1000 } ) ).toEqual( {
			from: undefined,
			to: undefined,
		} );
	} );
} );
