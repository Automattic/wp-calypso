import {
	UK_FIELD_IDS,
	getUkContactFormFields,
	getUkContactFormLayout,
	hasUkDomain,
	isUkDomain,
	mapWhoisExtraToUkContactExtra,
} from '../uk-contact-fields';
import type { DomainContactDetails } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const fieldById = ( fields: Field< DomainContactDetails >[], id: string ) =>
	fields.find( ( field ) => field.id === id );

describe( 'isUkDomain', () => {
	test.each( [
		'philemon.co.uk',
		'example.uk',
		'example.me.uk',
		'example.org.uk',
		'EXAMPLE.CO.UK',
	] )( 'treats %s as a .uk domain', ( domainName ) => {
		expect( isUkDomain( domainName ) ).toBe( true );
	} );

	test.each( [ 'example.com', 'example.co.uk.com', 'exampleuk', 'example.ukx' ] )(
		'treats %s as a non-.uk domain',
		( domainName ) => {
			expect( isUkDomain( domainName ) ).toBe( false );
		}
	);
} );

describe( 'hasUkDomain', () => {
	it( 'is true when any selected domain is a .uk one', () => {
		expect( hasUkDomain( [ 'example.com', 'philemon.co.uk' ] ) ).toBe( true );
	} );

	it( 'is false when none are', () => {
		expect( hasUkDomain( [ 'example.com', 'example.fr' ] ) ).toBe( false );
	} );

	it( 'is false for an empty selection', () => {
		expect( hasUkDomain( [] ) ).toBe( false );
	} );
} );

describe( 'getUkContactFormFields', () => {
	it( 'always requires a registrant type and offers no pre-selected value', () => {
		const registrantType = fieldById(
			getUkContactFormFields( undefined ),
			UK_FIELD_IDS.registrantType
		);

		expect( registrantType?.isValid?.required ).toBe( true );
		// An empty first option keeps the control unselected, so a registrant whose
		// stored type is unknown has to choose rather than inheriting a default.
		expect( registrantType?.elements?.[ 0 ] ).toEqual( {
			label: expect.any( String ),
			value: '',
		} );
		expect( registrantType?.getValue?.( { item: { optOutTransferLock: false } } ) ).toBe( '' );
	} );

	it( 'omits the conditional fields for a registrant type that needs neither', () => {
		const fields = getUkContactFormFields( 'IND' );

		expect( fieldById( fields, UK_FIELD_IDS.tradingName ) ).toBeUndefined();
		expect( fieldById( fields, UK_FIELD_IDS.registrationNumber ) ).toBeUndefined();
		expect( getUkContactFormLayout( 'IND' ) ).toEqual( [ UK_FIELD_IDS.registrantType ] );
	} );

	it( 'adds both conditional fields for a corporate registrant type', () => {
		const fields = getUkContactFormFields( 'LTD' );

		expect( fieldById( fields, UK_FIELD_IDS.tradingName )?.isValid?.required ).toBe( true );
		expect( fieldById( fields, UK_FIELD_IDS.registrationNumber )?.isValid?.required ).toBe( true );
		expect( getUkContactFormLayout( 'LTD' ) ).toEqual( [
			UK_FIELD_IDS.registrantType,
			UK_FIELD_IDS.tradingName,
			UK_FIELD_IDS.registrationNumber,
		] );
	} );

	it( 'adds only the trading name for a sole trader', () => {
		expect( getUkContactFormLayout( 'STRA' ) ).toEqual( [
			UK_FIELD_IDS.registrantType,
			UK_FIELD_IDS.tradingName,
		] );
	} );

	it( 'adds only the registration number for a school', () => {
		expect( getUkContactFormLayout( 'SCH' ) ).toEqual( [
			UK_FIELD_IDS.registrantType,
			UK_FIELD_IDS.registrationNumber,
		] );
	} );

	it( 'reads nested values out of extra.uk', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: { uk: { registrantType: 'LTD', tradingName: 'Stuart Lee Therapy' } },
		};

		const fields = getUkContactFormFields( 'LTD' );

		expect( fieldById( fields, UK_FIELD_IDS.registrantType )?.getValue?.( { item } ) ).toBe(
			'LTD'
		);
		expect( fieldById( fields, UK_FIELD_IDS.tradingName )?.getValue?.( { item } ) ).toBe(
			'Stuart Lee Therapy'
		);
	} );

	it( 'returns the whole extra object on edit so sibling values survive the shallow merge', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: {
				ca: { legalType: 'CCT' },
				uk: { registrantType: 'LTD', registrationNumber: '12345678' },
			},
		};

		const tradingName = fieldById( getUkContactFormFields( 'LTD' ), UK_FIELD_IDS.tradingName );

		expect( tradingName?.setValue?.( { item, value: 'Stuart Lee Therapy' } ) ).toEqual( {
			extra: {
				ca: { legalType: 'CCT' },
				uk: {
					registrantType: 'LTD',
					registrationNumber: '12345678',
					tradingName: 'Stuart Lee Therapy',
				},
			},
		} );
	} );

	it( 'rejects a registration number that does not match the registrar format', () => {
		const field = fieldById( getUkContactFormFields( 'LTD' ), UK_FIELD_IDS.registrationNumber );

		const pattern = new RegExp( field?.isValid?.pattern ?? '' );

		expect( pattern.test( '12345678' ) ).toBe( true );
		expect( pattern.test( 'AB123456' ) ).toBe( true );
		expect( pattern.test( 'A1234567' ) ).toBe( true );
		expect( pattern.test( '12345' ) ).toBe( false );
		expect( pattern.test( 'not-a-number' ) ).toBe( false );
	} );
} );

describe( 'mapWhoisExtraToUkContactExtra', () => {
	it( 'converts the registrar snake_case keys to the form shape', () => {
		expect(
			mapWhoisExtraToUkContactExtra( {
				registrant_type: 'LTD',
				trading_name: 'Stuart Lee Therapy',
				registration_number: '12345678',
			} )
		).toEqual( {
			registrantType: 'LTD',
			tradingName: 'Stuart Lee Therapy',
			registrationNumber: '12345678',
		} );
	} );

	it( 'omits conditional values the registrar has not stored', () => {
		expect( mapWhoisExtraToUkContactExtra( { registrant_type: 'IND' } ) ).toEqual( {
			registrantType: 'IND',
		} );
	} );

	it( 'returns undefined when there is no stored registrant type, rather than guessing one', () => {
		expect( mapWhoisExtraToUkContactExtra( undefined ) ).toBeUndefined();
		expect( mapWhoisExtraToUkContactExtra( {} ) ).toBeUndefined();
		expect( mapWhoisExtraToUkContactExtra( { registrant_type: '' } ) ).toBeUndefined();
	} );
} );
