import {
	CA_FIELD_IDS,
	getCaContactFormFields,
	getCaContactFormLayout,
	hasCaDomain,
	isCaDomain,
	mapWhoisExtraToCaContactExtra,
} from '../ca-contact-fields';
import type { DomainContactDetails } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const fieldById = ( fields: Field< DomainContactDetails >[], id: string ) =>
	fields.find( ( field ) => field.id === id );

describe( 'isCaDomain', () => {
	test.each( [ 'example.ca', 'EXAMPLE.CA' ] )( 'treats %s as a .ca domain', ( domainName ) => {
		expect( isCaDomain( domainName ) ).toBe( true );
	} );

	test.each( [ 'example.com', 'example.ca.com', 'exampleca', 'example.cat' ] )(
		'treats %s as a non-.ca domain',
		( domainName ) => {
			expect( isCaDomain( domainName ) ).toBe( false );
		}
	);
} );

describe( 'hasCaDomain', () => {
	it( 'is true when any selected domain is a .ca one', () => {
		expect( hasCaDomain( [ 'example.com', 'example.ca' ] ) ).toBe( true );
	} );

	it( 'is false when none are', () => {
		expect( hasCaDomain( [ 'example.com', 'example.fr' ] ) ).toBe( false );
	} );

	it( 'is false for an empty selection', () => {
		expect( hasCaDomain( [] ) ).toBe( false );
	} );
} );

describe( 'getCaContactFormFields', () => {
	it( 'always requires a legal type and offers no pre-selected value', () => {
		const legalType = fieldById( getCaContactFormFields(), CA_FIELD_IDS.legalType );

		expect( legalType?.isValid?.required ).toBe( true );
		// An empty first option keeps the control unselected, so a registrant whose
		// stored type is unknown has to choose rather than inheriting a default.
		expect( legalType?.elements?.[ 0 ] ).toEqual( {
			label: expect.any( String ),
			value: '',
		} );
		expect( legalType?.getValue?.( { item: { optOutTransferLock: false } } ) ).toBe( '' );
	} );

	it( 'offers all 18 CIRA legal types', () => {
		const legalType = fieldById( getCaContactFormFields(), CA_FIELD_IDS.legalType );

		// 18 legal types plus the empty "Select an option" placeholder.
		expect( legalType?.elements ).toHaveLength( 19 );
		expect( legalType?.elements?.map( ( element ) => element.value ) ).toContain( 'CCT' );
		expect( legalType?.elements?.map( ( element ) => element.value ) ).toContain( 'CCO' );
	} );

	it( 'lays out the legal type field', () => {
		expect( getCaContactFormLayout() ).toEqual( [ CA_FIELD_IDS.legalType ] );
	} );

	it( 'reads nested values out of extra.ca', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: { ca: { legalType: 'CCO' } },
		};

		const legalType = fieldById( getCaContactFormFields(), CA_FIELD_IDS.legalType );

		expect( legalType?.getValue?.( { item } ) ).toBe( 'CCO' );
	} );

	it( 'returns the whole extra object on edit so sibling values survive the shallow merge', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: {
				uk: { registrantType: 'IND' },
				ca: { legalType: 'CCT', lang: 'FR' },
			},
		};

		const legalType = fieldById( getCaContactFormFields(), CA_FIELD_IDS.legalType );

		expect( legalType?.setValue?.( { item, value: 'CCO' } ) ).toEqual( {
			extra: {
				uk: { registrantType: 'IND' },
				ca: { legalType: 'CCO', lang: 'FR' },
			},
		} );
	} );
} );

describe( 'mapWhoisExtraToCaContactExtra', () => {
	it( 'converts the registrar snake_case keys to the form shape', () => {
		expect( mapWhoisExtraToCaContactExtra( { legal_type: 'CCO', lang: 'FR' } ) ).toEqual( {
			legalType: 'CCO',
			lang: 'FR',
		} );
	} );

	it( 'omits the language when the registrar has not stored one', () => {
		expect( mapWhoisExtraToCaContactExtra( { legal_type: 'CCT' } ) ).toEqual( {
			legalType: 'CCT',
		} );
	} );

	it( 'returns undefined when there is no stored legal type, rather than guessing one', () => {
		expect( mapWhoisExtraToCaContactExtra( undefined ) ).toBeUndefined();
		expect( mapWhoisExtraToCaContactExtra( {} ) ).toBeUndefined();
		expect( mapWhoisExtraToCaContactExtra( { legal_type: '' } ) ).toBeUndefined();
	} );
} );
