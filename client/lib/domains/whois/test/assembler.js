/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import whoisAssembler from './../assembler';
import { whoisType } from './../constants';

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

function buildEmptyWhois( type ) {
	return {
		type,
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
}

function buildWhois( suffix, type ) {
	return {
		type,
		firstName: FIRST_NAME + suffix,
		lastName: LAST_NAME + suffix,
		organization: ORGANIZATION + suffix,
		address1: ADDRESS + suffix,
		address2: ADDRESS_LINE_2 + suffix,
		city: CITY + suffix,
		state: STATE_CODE + suffix,
		stateName: STATE + suffix,
		postalCode: POSTAL_CODE + suffix,
		countryCode: COUNTRY_CODE + suffix,
		countryName: COUNTRY + suffix,
		email: EMAIL + suffix,
		phone: PHONE + suffix,
		fax: FAX + suffix
	};
}

function buildWhoisTranferObject( suffix, type ) {
	return {
		type,
		fname: FIRST_NAME + suffix,
		lname: LAST_NAME + suffix,
		org: ORGANIZATION + suffix,
		sa1: ADDRESS + suffix,
		sa2: ADDRESS_LINE_2 + suffix,
		city: CITY + suffix,
		state: STATE_CODE + suffix,
		sp: STATE + suffix,
		pc: POSTAL_CODE + suffix,
		country_code: COUNTRY_CODE + suffix,
		cc: COUNTRY + suffix,
		email: EMAIL + suffix,
		phone: PHONE + suffix,
		fax: FAX + suffix
	};
}

describe( 'assembler', () => {
	const { REGISTRANT, PRIVACY_SERVICE } = whoisType;

	it( 'should return WHOIS with empty contact info when there is no valid entry in data transfer object', () => {
		const invalidDataTransferObject = [ { type: 'anything' } ],
			expectedDomainWhois = [
				buildEmptyWhois( REGISTRANT ),
				buildEmptyWhois( PRIVACY_SERVICE )
			];

		expect( whoisAssembler.createDomainWhois( invalidDataTransferObject ) ).to.be.eql( expectedDomainWhois );
	} );

	it( 'should return WHOIS with empty contact info when there is an empty registrant entry in data transfer object', () => {
		const emptyDataTransferObject = [ {
				type: REGISTRANT
			} ],
			expectedDomainWhois = [
				buildEmptyWhois( REGISTRANT ),
				buildEmptyWhois( PRIVACY_SERVICE )
			];

		expect( whoisAssembler.createDomainWhois( emptyDataTransferObject ) ).to.be.eql( expectedDomainWhois );
	} );

	it( 'should return full registrant and empty privacy service WHOIS when there is only registrant entry in data transfer object', () => {
		const registrantDataTransferObject = [
				buildWhoisTranferObject( 1, REGISTRANT )
			],
			expectedDomainWhois = [
				buildWhois( 1, REGISTRANT ),
				buildEmptyWhois( PRIVACY_SERVICE )
			];

		expect( whoisAssembler.createDomainWhois( registrantDataTransferObject ) ).to.be.eql( expectedDomainWhois );
	} );

	it( 'should return full registrant and privacy service WHOIS when there are both entries in data transfer object', () => {
		const registrantDataTransferObject = [
				buildWhoisTranferObject( 1, REGISTRANT ),
				buildWhoisTranferObject( 2, PRIVACY_SERVICE )
			],
			expectedDomainWhois = [
				buildWhois( 1, REGISTRANT ),
				buildWhois( 2, PRIVACY_SERVICE )
			];

		expect( whoisAssembler.createDomainWhois( registrantDataTransferObject ) ).to.be.eql( expectedDomainWhois );
	} );

	it( 'should return full registrant and privacy service WHOIS when data transfer object is shuffled', () => {
		const registrantDataTransferObject = [
				buildWhoisTranferObject( 2, PRIVACY_SERVICE ),
				buildWhoisTranferObject( 1, REGISTRANT )
			],
			expectedDomainWhois = [
				buildWhois( 1, REGISTRANT ),
				buildWhois( 2, PRIVACY_SERVICE )
			];

		expect( whoisAssembler.createDomainWhois( registrantDataTransferObject ) ).to.be.eql( expectedDomainWhois );
	} );
} );
