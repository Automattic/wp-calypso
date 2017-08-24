/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import validateContactDetails from '../fr-validate-contact-details';

describe( 'validateContactDetails', function() {
	const contactDetails = {
		firstName: 'J. Random',
		lastName: 'Tester',
		organization: 'Automattic',
		address1: '56 rue Banaudonsssss',
		address2: '',
		postalCode: '69005',
		city: 'LYON',
		state: 'Rhone-Alpes',
		countryCode: 'FR',
		email: 'test@example.com',
		phone: '+1.2506382995',
		extra: {
			sirenSiret: '123456789',
			registrantVatId: 'FRXX12345678901234',
			trademarkNumber: '12'
		}
	};

	it( 'should accept valid data', function() {
		expect( validateContactDetails( contactDetails ) ).to.eql( {} );
	} );

	// validateContactDetails data
	const realSiretNumbers = [
		[ '77575187800015' ],
		[ '40064155100017' ],
		[ '40064155100017' ],
		[ '38474709300043' ],
		[ '42399687500013' ],
		[ '45316192900014' ],
		[ '53615016200025' ],
		[ '42290307000023' ],
		[ '47793466500035' ],
		[ '33445848600019' ],
	];

	describe( 'SIREN/SIRET', function() {
		it( 'should accept all real SIRET examples', function() {
			realSiretNumbers.forEach(
				( [ sirenSiret ] ) => {
					const testDetails = Object.assign(
						{},
						contactDetails,
						{ extra: { sirenSiret } }
					);

					expect( validateContactDetails( testDetails ) ).to.eql( {} );
				}
			);
		} );

		it( 'should reject our bad SIRET examples', function() {
			const badSiretNumbers = [
				[ 'Nonnumber' ],
				[ '12345678' ],
				[ '123456789012345' ],
				[ 'LT999999999999' ], // 14 digit VAT code
			];

			badSiretNumbers.forEach(
				( [ sirenSiret ] ) => {
					const testDetails = Object.assign(
						{},
						contactDetails,
						{ extra: { sirenSiret } }
					);

					expect( validateContactDetails( testDetails ) )
						.to.have.property( 'extra' )
						.with.property( 'sirenSiret' );
				}
			);
		} );
	} );

	describe( 'VAT', function() {
		it( 'should accept VAT patterns', function() {
			const vatPatterns = [
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
				[ 'ESX9999999X4' ],
				[ 'FI99999999' ],
				[ 'FRXX999999999' ],
				[ 'HR99999999999' ],
				[ 'HU99999999' ],
				[ 'IE9+99999L' ],
				[ 'IE9*99999L' ],
				[ 'IE9999999WI' ],
				[ 'IT99999999999' ],
				[ 'LT999999999' ],
				[ 'LT999999999999' ],
				[ 'LU99999999' ],
				[ 'LV99999999999' ],
				[ 'MT99999999' ],
				[ 'NL999999999B998' ],
				[ 'PL9999999999' ],
				[ 'PT999999999' ],
				[ 'RO999999999' ],
				[ 'SE999999999999' ],
				[ 'SI99999999' ],
				[ 'SK9999999999' ],
				// GB :(
				[ '999999GB999' ],
				[ 'GB999999999' ],
				[ 'GB9999999999995' ],
				[ 'GBGD9996' ],
				[ 'GBHA9997' ],
			];

			vatPatterns.forEach(
				( [ registrantVatId ] ) => {
					const testDetails = Object.assign(
						{},
						contactDetails,
						{ extra: { registrantVatId } }
					);
					expect( validateContactDetails( testDetails ) )
						.to.eql( {} );
				}
			);
		} );

		it( 'should reject SIRET for VAT', function() {
			realSiretNumbers.forEach(
				( [ registrantVatId ] ) => {
					const testDetails = Object.assign(
						{},
						contactDetails,
						{ extra: { registrantVatId } }
					);
					expect( validateContactDetails( testDetails ) )
						.to.have.property( 'extra' )
						.with.property( 'registrantVatId' );
				}
			);
		} );
	} );
} );
