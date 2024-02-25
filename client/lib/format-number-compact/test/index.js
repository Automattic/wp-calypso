import { formatNumberMetric } from 'calypso/lib/format-number-compact';

describe( 'formatNumberMetric', () => {
	test( 'does not abbreviate numbers smaller than 1000', () => {
		expect( formatNumberMetric( 123 ) ).toEqual( '123' );
	} );

	test( 'appends the K unit', () => {
		expect( formatNumberMetric( 123456 ) ).toEqual( '123.5K' );
	} );

	test( 'appends the M unit', () => {
		expect( formatNumberMetric( 123456789 ) ).toEqual( '123.5M' );
	} );

	test( 'appends the G unit', () => {
		expect( formatNumberMetric( 123456789012 ) ).toEqual( '123.5G' );
	} );

	test( 'rounds numbers with metric units to 1 decimal point', () => {
		expect( formatNumberMetric( 4500 ) ).toEqual( '4.5K' );
		expect( formatNumberMetric( 12490 ) ).toEqual( '12.5K' );
		expect( formatNumberMetric( 123546789 ) ).toEqual( '123.5M' );
	} );
} );
