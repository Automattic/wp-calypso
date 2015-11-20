/**
 * External dependencies
 */
const expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
const whoisAssembler = require( './../assembler' );

describe( 'Domains WHOIS assembler', () => {
	const FIRST_NAME = 'First-name',
		LAST_NAME = 'Last-name',
		ORGANIZATION = 'Organisation',
		ADDRESS = 'Address line 1',
		ADDRESS_LINE_2 = 'Address line 2',
		CITY = 'City',
		STATE_CODE = 'ST',
		STATE = 'State',
		POSTAL_CODE = '12345',
		COUNTRY_CODE = 'CO',
		COUNTRY = 'Country',
		EMAIL = 'email@email.com',
		PHONE = '123456789',
		FAX = '987654321';

	it( 'should return object with default contact info when there is no registrant entry in data transfer object', () => {
		const invalidDataTransferObject = [ { type: 'anything' } ],
			expectedDomainObject = {
				firstName: '',
				lastName: '',
				organization: '',
				address1: '',
				address2: '',
				city: '',
				state: '',
				stateName: '',
				postalCode: '',
				countryCode: '',
				countryName: '',
				email: '',
				phone: '',
				fax: ''
			};

		expect( whoisAssembler.createDomainObject( invalidDataTransferObject ) ).to.be.eql( expectedDomainObject );
	} );

	it( 'should return object with default contact info when there is any registrant entry in data transfer object', () => {
		const emptyDataTransferObject = [ {
				type: 'registrant'
			} ],
			expectedDomainObject = {
				firstName: '',
				lastName: '',
				organization: '',
				address1: '',
				address2: '',
				city: '',
				state: '',
				stateName: '',
				postalCode: '',
				countryCode: '',
				countryName: '',
				email: '',
				phone: '',
				fax: ''
			};

		expect( whoisAssembler.createDomainObject( emptyDataTransferObject ) ).to.be.eql( expectedDomainObject );
	} );

	it( 'should return object with all contact info when there is full registrant entry in data transfer object', () => {
		const registrantDataTransferObject = [ {
				type: 'registrant',
				fname: FIRST_NAME,
				lname: LAST_NAME,
				org: ORGANIZATION,
				sa1: ADDRESS,
				sa2: ADDRESS_LINE_2,
				city: CITY,
				state: STATE_CODE,
				sp: STATE,
				pc: POSTAL_CODE,
				country_code: COUNTRY_CODE,
				cc: COUNTRY,
				email: EMAIL,
				phone: PHONE,
				fax: FAX
			} ],
			expectedDomainObject = {
				firstName: FIRST_NAME,
				lastName: LAST_NAME,
				organization: ORGANIZATION,
				address1: ADDRESS,
				address2: ADDRESS_LINE_2,
				city: CITY,
				state: STATE_CODE,
				stateName: STATE,
				postalCode: POSTAL_CODE,
				countryCode: COUNTRY_CODE,
				countryName: COUNTRY,
				email: EMAIL,
				phone: PHONE,
				fax: FAX
			};

		expect( whoisAssembler.createDomainObject( registrantDataTransferObject ) ).to.be.eql( expectedDomainObject );
	} );
} );
