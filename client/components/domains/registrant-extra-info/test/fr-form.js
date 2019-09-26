/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { sanitizeVat } from '../fr-form';

describe( 'fr-form', () => {
	describe( 'VAT Sanitation', () => {
		test( 'should clean invalid characters', () => {
			const vatPatterns = [
				{ before: 'FR 99999999999', after: 'FR99999999999' },
				{ before: ' FR99999999999', after: 'FR99999999999' },
				{ before: 'FR99999999999 ', after: 'FR99999999999' },
				{ before: ' FR99 999 9 99999 ', after: 'FR99999999999' },
				{ before: ' FR99@99!99&999()99 ', after: 'FR99999999999' },
				{ before: 'Atu99999999', after: 'ATU99999999' },
			];

			vatPatterns.forEach( ( { before, after } ) =>
				expect( sanitizeVat( before ) ).to.eql( after )
			);
		} );

		test( 'should preserve valid patterns', () => {
			// [ pattern, optionalDescription ]
			// These are just patterns, not valid numbers.
			const validVatPatterns = [
				[ 'ATU99999999' ],
				[ 'BE0999999999' ],
				[ 'BG999999999' ],
				[ 'BG9999999999' ],
				[ 'CY99999999L' ],
				[ 'CZ99999999' ],
				[ 'CZ999999999' ],
				[ 'CZ9999999999' ],
				[ 'DE999999999' ],
				[ 'DK99999999' ],
				[ 'EE999999999' ],
				[ 'EL999999999' ],
				[ 'ESX9999999X' ],
				[ 'ES99999999X' ],
				[ 'FI99999999' ],
				[ 'FRXX999999999' ],
				[ 'FR99999999999' ],
				[ 'HR99999999999' ],
				[ 'HU99999999' ],
				[ 'IE9+99999L', 'special character' ],
				[ 'IE9*99999L', 'special character' ],
				[ 'IE9X99999L' ],
				[ 'IE9999999L' ],
				[ 'IE9999999WI' ],
				[ 'IT99999999999' ],
				[ 'LT999999999' ],
				[ 'LT999999999999' ],
				[ 'LU99999999' ],
				[ 'LV99999999999' ],
				[ 'MT99999999' ],
				[ 'NL999999999B99', 'extra alphanumeric character' ],
				[ 'PL9999999999' ],
				[ 'PT999999999' ],
				[ 'RO999999999' ],
				[ 'SE999999999999' ],
				[ 'SI99999999' ],
				[ 'SK9999999999' ],
				// GB :(
				[ 'GB999999999' ],
				[ 'GB999999999999' ],
				[ 'GBGD9996' ],
				[ 'GBHA9997' ],
			];

			validVatPatterns.forEach( ( [ pattern, description ] ) =>
				expect( sanitizeVat( pattern ) ).to.eql( pattern.toUpperCase(), description )
			);
		} );
	} );
} );
