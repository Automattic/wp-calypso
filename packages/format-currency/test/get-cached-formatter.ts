import { getCachedFormatter } from '../src/get-cached-formatter';

describe( 'getFormatter', () => {
	it( 'should return a cached formatter when one exists', () => {
		const locale = 'en-US';
		const options: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };

		// Get formatter for the first time
		const formatter1 = getCachedFormatter( { locale, options } );

		// Get formatter for the second time
		const formatter2 = getCachedFormatter( { locale, options } );

		// Check that the same formatter instance is returned
		expect( formatter1 ).toBe( formatter2 );

		// Check that the formatter formats correctly
		expect( formatter1.format( 1234.56 ) ).toBe( '$1,234.56' );
	} );

	it( 'should create a new formatter when options are different', () => {
		const locale = 'en-US';
		const options1: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
		const options2: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR' };

		// Get formatter for the first set of options
		const formatter1 = getCachedFormatter( { locale, options: options1 } );

		// Get formatter for the second set of options
		const formatter2 = getCachedFormatter( { locale, options: options2 } );

		// Check that different formatter instances are returned
		expect( formatter1 ).not.toBe( formatter2 );

		// Check that the formatters format correctly
		expect( formatter1.format( 1234.56 ) ).toBe( '$1,234.56' );
		expect( formatter2.format( 1234.56 ) ).toBe( '€1,234.56' );
	} );
} );
