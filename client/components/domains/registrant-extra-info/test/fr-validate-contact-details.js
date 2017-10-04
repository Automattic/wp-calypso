/** @format */
/**
 * External Dependencies
 */
import { expect } from 'chai';
import { omit } from 'lodash';

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
			trademarkNumber: '123456789',
		},
	};

	it( 'should accept valid example data (sanity check)', function() {
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
			realSiretNumbers.forEach( ( [ sirenSiret ] ) => {
				const testDetails = Object.assign( {}, contactDetails, { extra: { sirenSiret } } );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to accept '${ sirenSiret }'` ).to.eql( {} );
			} );
		} );

		it( 'should reject our bad SIRET examples', function() {
			const badSiretNumbers = [
				[ 'Nonnumber' ],
				[ '12345678' ],
				[ '123456789012345' ],
				[ 'LT999999999999' ], // 14 digit VAT code
			];

			badSiretNumbers.forEach( ( [ sirenSiret ] ) => {
				const testDetails = Object.assign( {}, contactDetails, { extra: { sirenSiret } } );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to reject '${ sirenSiret }'` )
					.to.have.property( 'extra' )
					.with.property( 'sirenSiret' );
			} );
		} );

		it( 'should accept an empty value', function() {
			const testDetails = Object.assign( {}, contactDetails, { extra: { sirenSiret: '' } } );

			const result = validateContactDetails( testDetails );
			expect( result ).to.eql( {} );
		} );

		it( 'should accept a missing value', function() {
			const testDetails = {
				...contactDetails,
				extra: omit( contactDetails.extra, 'sirenSiret' ),
			};

			expect( validateContactDetails( testDetails ) ).to.eql( {} );
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
				[ 'ES99999999X4' ],
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
				[ 'NL999999999B998', 'extra alphanumeric character' ],
				[ 'PL9999999999' ],
				[ 'PT999999999' ],
				[ 'RO999999999' ],
				[ 'SE999999999999' ],
				[ 'SI99999999' ],
				[ 'SK9999999999' ],
				[ 'sk9999999999', 'lowercase' ],
				// GB :(
				[ '999999GB999' ],
				[ 'GB999999999' ],
				[ 'GB9999999999995' ],
				[ 'GBGD9996' ],
				[ 'GBHA9997' ],
			];

			vatPatterns.forEach( ( [ registrantVatId ] ) => {
				const testDetails = Object.assign( {}, contactDetails, { extra: { registrantVatId } } );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to accept '${ registrantVatId }'` ).to.eql( {} );
			} );
		} );

		it( 'should reject SIRET for VAT', function() {
			realSiretNumbers.forEach( ( [ registrantVatId ] ) => {
				const testDetails = Object.assign( {}, contactDetails, { extra: { registrantVatId } } );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to reject '${ registrantVatId }'` )
					.to.have.property( 'extra' )
					.with.property( 'registrantVatId' );
			} );
		} );

		it( 'should accept an empty value', function() {
			const testDetails = Object.assign( {}, contactDetails, { extra: { registrantVatId: '' } } );

			const result = validateContactDetails( testDetails );
			expect( result ).to.eql( {} );
		} );

		it( 'should accept a missing value', function() {
			const testDetails = {
				...contactDetails,
				extra: omit( contactDetails.extra, 'registrantVatId' ),
			};

			expect( validateContactDetails( testDetails ) ).to.eql( {} );
		} );
	} );

	describe( 'trademarkNumber', function() {
		const goodTrademarkNumbers = [ [ '012345678' ], [ '999999999' ], [ '000000001' ] ];

		const badTrademarkNumbers = [ [ '123456' ], [ '88888888' ], [ '1' ], [ 'ABCDEFGHI' ] ];

		it( 'should accept all good trademark examples', function() {
			goodTrademarkNumbers.forEach( ( [ trademarkNumber ] ) => {
				const testDetails = Object.assign( {}, contactDetails, { extra: { trademarkNumber } } );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to accept '${ trademarkNumber }'` ).to.eql( {} );
			} );
		} );

		it( 'should reject our bad SIRET examples', function() {
			badTrademarkNumbers.forEach( ( [ trademarkNumber ] ) => {
				const testDetails = Object.assign( {}, contactDetails, { extra: { trademarkNumber } } );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to reject '${ trademarkNumber }'` )
					.to.have.property( 'extra' )
					.with.property( 'trademarkNumber' );
			} );
		} );

		it( 'should accept an empty value', function() {
			const testDetails = Object.assign( {}, contactDetails, { extra: { trademarkNumber: '' } } );

			const result = validateContactDetails( testDetails );
			expect( result ).to.eql( {} );
		} );

		it( 'should accept a missing value', function() {
			const testDetails = {
				...contactDetails,
				extra: omit( contactDetails.extra, 'trademarkNumber' ),
			};

			expect( validateContactDetails( testDetails ) ).to.eql( {} );
		} );
	} );
} );
