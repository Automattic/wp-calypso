/**
 * External dependencies
 */
import { expect } from 'chai';
import { omit, repeat } from 'lodash';

/**
 * Internal dependencies
 */
import validateContactDetails from '../fr-validate-contact-details';

describe( 'validateContactDetails', () => {
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
			fr: {
				registrantType: 'individual',
				sirenSiret: '123456789',
				registrantVatId: 'FRXX123456789',
				trademarkNumber: '123456789',
			},
			uk: {
				registrantType: 'fake_stuff',
			},
		},
	};

	function contactWithExtraProperty( property, value ) {
		return Object.assign( {}, contactDetails, {
			extra: {
				fr: {
					...contactDetails.extra.fr,
					[ property ]: value,
				},
			},
		} );
	}

	test( 'should accept valid example data (sanity check)', () => {
		expect( validateContactDetails( contactDetails ) ).to.eql( {} );
	} );

	test( 'should handle missing extra', () => {
		const testDetails = omit( contactDetails, 'extra' );

		expect( validateContactDetails( testDetails ) ).to.have.property( 'extra' );
	} );

	test( 'should handle null extra', () => {
		const testDetails = Object.assign( {}, contactDetails, {
			extra: null,
		} );

		expect( validateContactDetails( testDetails ) ).to.have.property( 'extra' );
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

	describe( 'organization', () => {
		describe( 'with registrantType: organization', () => {
			const organizationDetails = Object.assign( {}, contactDetails, {
				extra: { fr: { registrantType: 'organization' } },
			} );

			test( 'should accept an organization', () => {
				expect( validateContactDetails( organizationDetails ) ).to.eql( {} );
			} );

			test( 'should not be missing', () => {
				const testDetails = omit( organizationDetails, 'organization' );

				const result = validateContactDetails( testDetails );
				expect( result ).to.have.property( 'organization' );
			} );

			test( 'should not be empty', () => {
				const testDetails = Object.assign( {}, organizationDetails, { organization: '' } );

				const result = validateContactDetails( testDetails );
				expect( result ).to.have.property( 'organization' );
			} );

			test( 'should reject long strings', () => {
				const testDetails = Object.assign( {}, organizationDetails, {
					organization: repeat( '0123456789', 11 ),
				} );

				const result = validateContactDetails( testDetails );
				expect( result ).to.have.property( 'organization' );
			} );

			test( 'should reject invalid characters', () => {
				const testDetails = Object.assign( {}, organizationDetails, {
					organization: 'No bangs, please!',
				} );

				const result = validateContactDetails( testDetails );
				expect( result ).to.have.property( 'organization' );
			} );
		} );

		describe( 'with registrantType: individual', () => {
			const individualDetails = Object.assign( {}, contactDetails, {
				extra: { fr: { registrantType: 'individual' } },
			} );

			test( 'should accept missing organization', () => {
				const testDetails = omit( individualDetails, 'organization' );

				const result = validateContactDetails( testDetails );
				expect( result ).to.eql( {} );
			} );

			test( 'should accept null organization', () => {
				const testDetails = Object.assign( {}, individualDetails, { organization: '' } );

				const result = validateContactDetails( testDetails );
				expect( result ).to.eql( {} );
			} );

			test( 'should accept empty organization', () => {
				const testDetails = Object.assign( {}, individualDetails, { organization: '' } );

				const result = validateContactDetails( testDetails );
				expect( result ).to.eql( {} );
			} );
		} );
	} );

	describe( 'SIREN/SIRET', () => {
		test( 'should accept all real SIRET examples', () => {
			realSiretNumbers.forEach( ( [ sirenSiret ] ) => {
				const testDetails = contactWithExtraProperty( 'sirenSiret', sirenSiret );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to accept '${ sirenSiret }'` ).to.eql( {} );
			} );
		} );

		test( 'should reject our bad SIRET examples', () => {
			const badSiretNumbers = [
				[ 'Nonnumber' ],
				[ '12345678' ],
				[ '123456789012345' ],
				[ 'LT999999999999' ], // 14 digit VAT code
			];

			badSiretNumbers.forEach( ( [ sirenSiret ] ) => {
				const testDetails = Object.assign( {}, contactDetails, { extra: { fr: { sirenSiret } } } );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to reject '${ sirenSiret }'` )
					.to.have.property( 'extra' )
					.with.property( 'fr' )
					.with.property( 'sirenSiret' );
			} );
		} );

		test( 'should accept an empty value', () => {
			const testDetails = contactWithExtraProperty( 'sirenSiret', '' );

			const result = validateContactDetails( testDetails );
			expect( result ).to.eql( {} );
		} );

		test( 'should accept a missing value', () => {
			const testDetails = {
				...contactDetails,
				extra: { fr: omit( contactDetails.extra.fr, 'sirenSiret' ) },
			};

			expect( validateContactDetails( testDetails ) ).to.eql( {} );
		} );
	} );

	describe( 'VAT Validation', () => {
		test( 'should accept VAT patterns', () => {
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
				[ 'GBGD999' ],
				[ 'GBHA999' ],
			];

			vatPatterns.forEach( ( [ registrantVatId ] ) => {
				const testDetails = contactWithExtraProperty( 'registrantVatId', registrantVatId );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to accept '${ registrantVatId }'` ).to.eql( {} );
			} );
		} );

		test( 'should reject SIRET for VAT', () => {
			realSiretNumbers.forEach( ( [ registrantVatId ] ) => {
				const testDetails = Object.assign( {}, contactDetails, {
					extra: { fr: { registrantVatId } },
				} );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to reject '${ registrantVatId }'` )
					.to.have.property( 'extra' )
					.with.property( 'fr' )
					.with.property( 'registrantVatId' );
			} );
		} );

		test( 'should accept an empty value', () => {
			const testDetails = contactWithExtraProperty( 'registrantVatId', '' );

			const result = validateContactDetails( testDetails );
			expect( result ).to.eql( {} );
		} );

		test( 'should accept a missing value', () => {
			const testDetails = {
				...contactDetails,
				extra: { fr: omit( contactDetails.extra.fr, 'registrantVatId' ) },
			};

			expect( validateContactDetails( testDetails ) ).to.eql( {} );
		} );
	} );

	describe( 'trademarkNumber', () => {
		const goodTrademarkNumbers = [ [ '012345678' ], [ '999999999' ], [ '000000001' ] ];

		const badTrademarkNumbers = [ [ '123456' ], [ '88888888' ], [ '1' ], [ 'ABCDEFGHI' ] ];

		test( 'should accept all good trademark examples', () => {
			goodTrademarkNumbers.forEach( ( [ trademarkNumber ] ) => {
				const testDetails = contactWithExtraProperty( 'trademarkNumber', trademarkNumber );

				const result = validateContactDetails( testDetails );
				expect( result, `expected to accept '${ trademarkNumber }'` ).to.eql( {} );
			} );
		} );

		test( 'should reject our bad SIRET examples', () => {
			badTrademarkNumbers.forEach( ( [ trademarkNumber ] ) => {
				const testDetails = Object.assign( {}, contactDetails, {
					extra: { fr: { trademarkNumber } },
				} );

				const result = validateContactDetails( testDetails );

				expect( result, `expected to reject '${ trademarkNumber }'` )
					.to.have.property( 'extra' )
					.with.property( 'fr' )
					.with.property( 'trademarkNumber' );
			} );
		} );

		test( 'should accept an empty value', () => {
			const testDetails = contactWithExtraProperty( 'trademarkNumber', '' );

			const result = validateContactDetails( testDetails );
			expect( result ).to.eql( {} );
		} );

		test( 'should accept a missing value', () => {
			const testDetails = {
				...contactDetails,
				extra: omit( contactDetails.extra, 'trademarkNumber' ),
			};

			expect( validateContactDetails( testDetails ) ).to.eql( {} );
		} );
	} );
} );
