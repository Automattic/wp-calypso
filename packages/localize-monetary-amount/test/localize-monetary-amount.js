/**
 * Internal dependencies
 */
import { localizeMonetaryAmount } from '../src/index';

describe( 'localizeMonetaryAmount', function() {
	describe( 'when locale is en-us', function() {
		test.each`
			currency | amount       | output
			${'USD'} | ${0}         | ${'$0'}
			${'USD'} | ${5}         | ${'$0.05'}
			${'USD'} | ${50}        | ${'$0.50'}
			${'USD'} | ${500}       | ${'$5'}
			${'USD'} | ${1010}      | ${'$10.10'}
			${'USD'} | ${1337}      | ${'$13.37'}
			${'USD'} | ${5000}      | ${'$50'}
			${'USD'} | ${50000}     | ${'$500'}
			${'USD'} | ${500000}    | ${'$5,000'}
			${'USD'} | ${5000000}   | ${'$50,000'}
			${'USD'} | ${50000000}  | ${'$500,000'}
			${'USD'} | ${500000000} | ${'$5,000,000'}
			${'USD'} | ${-500000}   | ${'-$5,000'}
			${'GBP'} | ${123456}    | ${'£1,234.56'}
			${'JPY'} | ${123456}    | ${'¥123,456'}
			${'EUR'} | ${123456}    | ${'€1,234.56'}
			${'CAD'} | ${123456}    | ${'$1,234.56\u00A0CAD'}
		`( 'en-us/$currency $amount => $output', ( { currency, amount, output } ) => {
			expect( localizeMonetaryAmount( 'en-us', currency, amount ) ).toBe( output );
		} );
	} );

	describe( 'when locale is en-ca', function() {
		test.each`
			currency | amount       | output
			${'CAD'} | ${0}         | ${'$0\u00A0CAD'}
			${'CAD'} | ${5}         | ${'$0.05\u00A0CAD'}
			${'CAD'} | ${50}        | ${'$0.50\u00A0CAD'}
			${'CAD'} | ${500}       | ${'$5\u00A0CAD'}
			${'CAD'} | ${1010}      | ${'$10.10\u00A0CAD'}
			${'CAD'} | ${1337}      | ${'$13.37\u00A0CAD'}
			${'CAD'} | ${5000}      | ${'$50\u00A0CAD'}
			${'CAD'} | ${50000}     | ${'$500\u00A0CAD'}
			${'CAD'} | ${500000}    | ${'$5\u00A0000\u00A0CAD'}
			${'CAD'} | ${5000000}   | ${'$50\u00A0000\u00A0CAD'}
			${'CAD'} | ${50000000}  | ${'$500\u00A0000\u00A0CAD'}
			${'CAD'} | ${500000000} | ${'$5\u00A0000\u00A0000\u00A0CAD'}
			${'CAD'} | ${-500000}   | ${'-$5\u00A0000\u00A0CAD'}
			${'GBP'} | ${123456}    | ${'£1\u00A0234.56'}
			${'JPY'} | ${123456}    | ${'¥123\u00A0456'}
			${'USD'} | ${123456}    | ${'$1\u00A0234.56\u00A0USD'}
			${'EUR'} | ${123456}    | ${'€1\u00A0234.56'}
			${'AUD'} | ${123456}    | ${'$1\u00A0234.56\u00A0AUD'}
		`( 'en-ca/$currency $amount => $output', ( { currency, amount, output } ) => {
			expect( localizeMonetaryAmount( 'en-ca', currency, amount ) ).toBe( output );
		} );
	} );

	describe( 'when locale is fr-ca', function() {
		test.each`
			currency | amount       | output
			${'CAD'} | ${0}         | ${'$0\u00A0CAD'}
			${'CAD'} | ${5}         | ${'$0,05\u00A0CAD'}
			${'CAD'} | ${50}        | ${'$0,50\u00A0CAD'}
			${'CAD'} | ${500}       | ${'$5\u00A0CAD'}
			${'CAD'} | ${1010}      | ${'$10,10\u00A0CAD'}
			${'CAD'} | ${1337}      | ${'$13,37\u00A0CAD'}
			${'CAD'} | ${5000}      | ${'$50\u00A0CAD'}
			${'CAD'} | ${50000}     | ${'$500\u00A0CAD'}
			${'CAD'} | ${500000}    | ${'$5\u00A0000\u00A0CAD'}
			${'CAD'} | ${5000000}   | ${'$50\u00A0000\u00A0CAD'}
			${'CAD'} | ${50000000}  | ${'$500\u00A0000\u00A0CAD'}
			${'CAD'} | ${500000000} | ${'$5\u00A0000\u00A0000\u00A0CAD'}
			${'CAD'} | ${-500000}   | ${'-$5\u00A0000\u00A0CAD'}
			${'GBP'} | ${123456}    | ${'£1\u00A0234,56'}
			${'JPY'} | ${123456}    | ${'¥123\u00A0456'}
			${'USD'} | ${123456}    | ${'$1\u00A0234,56\u00A0USD'}
			${'EUR'} | ${123456}    | ${'€1\u00A0234,56'}
			${'AUD'} | ${123456}    | ${'$1\u00A0234,56\u00A0AUD'}
		`( 'fr-ca/$currency $amount => $output', ( { currency, amount, output } ) => {
			expect( localizeMonetaryAmount( 'fr-ca', currency, amount ) ).toBe( output );
		} );
	} );

	describe( 'when locale is en-au', function() {
		test.each`
			currency | amount       | output
			${'AUD'} | ${0}         | ${'$0\u00A0AUD'}
			${'AUD'} | ${5}         | ${'$0.05\u00A0AUD'}
			${'AUD'} | ${50}        | ${'$0.50\u00A0AUD'}
			${'AUD'} | ${500}       | ${'$5\u00A0AUD'}
			${'AUD'} | ${1010}      | ${'$10.10\u00A0AUD'}
			${'AUD'} | ${1337}      | ${'$13.37\u00A0AUD'}
			${'AUD'} | ${5000}      | ${'$50\u00A0AUD'}
			${'AUD'} | ${50000}     | ${'$500\u00A0AUD'}
			${'AUD'} | ${500000}    | ${'$5\u00A0000\u00A0AUD'}
			${'AUD'} | ${5000000}   | ${'$50\u00A0000\u00A0AUD'}
			${'AUD'} | ${50000000}  | ${'$500\u00A0000\u00A0AUD'}
			${'AUD'} | ${500000000} | ${'$5\u00A0000\u00A0000\u00A0AUD'}
			${'AUD'} | ${-500000}   | ${'-$5\u00A0000\u00A0AUD'}
			${'GBP'} | ${123456}    | ${'£1\u00A0234.56'}
			${'JPY'} | ${123456}    | ${'¥123\u00A0456'}
			${'USD'} | ${123456}    | ${'$1\u00A0234.56\u00A0USD'}
			${'EUR'} | ${123456}    | ${'€1\u00A0234.56'}
			${'CAD'} | ${123456}    | ${'$1\u00A0234.56\u00A0CAD'}
		`( 'en-au/$currency $amount => $output', ( { currency, amount, output } ) => {
			expect( localizeMonetaryAmount( 'en-au', currency, amount ) ).toBe( output );
		} );
	} );

	describe( 'when locale is en-in', function() {
		test.each`
			currency | amount       | output
			${'INR'} | ${0}         | ${'₹0'}
			${'INR'} | ${5}         | ${'₹0.05'}
			${'INR'} | ${50}        | ${'₹0.50'}
			${'INR'} | ${500}       | ${'₹5'}
			${'INR'} | ${1010}      | ${'₹10.10'}
			${'INR'} | ${1337}      | ${'₹13.37'}
			${'INR'} | ${5000}      | ${'₹50'}
			${'INR'} | ${50000}     | ${'₹500'}
			${'INR'} | ${500000}    | ${'₹5,000'}
			${'INR'} | ${5000000}   | ${'₹50,000'}
			${'INR'} | ${50000000}  | ${'₹5,00,000'}
			${'INR'} | ${500000000} | ${'₹50,00,000'}
			${'INR'} | ${-500000}   | ${'-₹5,000'}
			${'GBP'} | ${123456789} | ${'£12,34,567.89'}
			${'JPY'} | ${123456789} | ${'¥12,34,56,789'}
			${'EUR'} | ${123456789} | ${'€12,34,567.89'}
			${'USD'} | ${123456789} | ${'$12,34,567.89\u00A0USD'}
			${'CAD'} | ${123456789} | ${'$12,34,567.89\u00A0CAD'}
		`( 'en-in/$currency $amount => $output', ( { currency, amount, output } ) => {
			expect( localizeMonetaryAmount( 'en-in', currency, amount ) ).toBe( output );
		} );
	} );

	describe( 'when locale is de', function() {
		test.each`
			currency | amount       | output
			${'EUR'} | ${0}         | ${'€0'}
			${'EUR'} | ${5}         | ${'€0,05'}
			${'EUR'} | ${50}        | ${'€0,50'}
			${'EUR'} | ${500}       | ${'€5'}
			${'EUR'} | ${1010}      | ${'€10,10'}
			${'EUR'} | ${1337}      | ${'€13,37'}
			${'EUR'} | ${5000}      | ${'€50'}
			${'EUR'} | ${50000}     | ${'€500'}
			${'EUR'} | ${500000}    | ${'€5.000'}
			${'EUR'} | ${5000000}   | ${'€50.000'}
			${'EUR'} | ${50000000}  | ${'€500.000'}
			${'EUR'} | ${500000000} | ${'€5.000.000'}
			${'EUR'} | ${-500000}   | ${'-€5.000'}
			${'GBP'} | ${123456}    | ${'£1.234,56'}
			${'JPY'} | ${123456}    | ${'¥123.456'}
			${'USD'} | ${123456}    | ${'$1.234,56\u00A0USD'}
			${'AUD'} | ${123456}    | ${'$1.234,56\u00A0AUD'}
			${'CAD'} | ${123456}    | ${'$1.234,56\u00A0CAD'}
		`( 'de/$currency $amount => $output', ( { currency, amount, output } ) => {
			expect( localizeMonetaryAmount( 'de', currency, amount ) ).toBe( output );
		} );
	} );
} );
