import {
	FR_FIELD_IDS,
	getFrContactFormFields,
	getFrContactFormLayout,
	hasFrDomain,
	isFrDomain,
	mapWhoisExtraToFrContactExtra,
	validateFrOrganization,
	withFrOrganizationValidation,
} from '../fr-contact-fields';
import type { DomainContactDetails } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const fieldById = ( fields: Field< DomainContactDetails >[], id: string ) =>
	fields.find( ( field ) => field.id === id );

describe( 'isFrDomain', () => {
	test.each( [ 'mariemerceron-dieteticienne.fr', 'example.fr', 'EXAMPLE.FR' ] )(
		'treats %s as a .fr domain',
		( domainName ) => {
			expect( isFrDomain( domainName ) ).toBe( true );
		}
	);

	test.each( [ 'example.com', 'example.fr.com', 'examplefr', 'example.fra' ] )(
		'treats %s as a non-.fr domain',
		( domainName ) => {
			expect( isFrDomain( domainName ) ).toBe( false );
		}
	);
} );

describe( 'hasFrDomain', () => {
	it( 'is true when any selected domain is a .fr one', () => {
		expect( hasFrDomain( [ 'example.com', 'example.fr' ] ) ).toBe( true );
	} );

	it( 'is false when none are', () => {
		expect( hasFrDomain( [ 'example.com', 'example.co.uk' ] ) ).toBe( false );
	} );

	it( 'is false for an empty selection', () => {
		expect( hasFrDomain( [] ) ).toBe( false );
	} );
} );

describe( 'getFrContactFormFields', () => {
	it( 'always requires a registrant type and offers no pre-selected value', () => {
		const registrantType = fieldById(
			getFrContactFormFields( undefined ),
			FR_FIELD_IDS.registrantType
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

	it( 'omits the organization fields for an individual registrant', () => {
		const fields = getFrContactFormFields( 'individual' );

		expect( fieldById( fields, FR_FIELD_IDS.registrantVatId ) ).toBeUndefined();
		expect( fieldById( fields, FR_FIELD_IDS.sirenSiret ) ).toBeUndefined();
		expect( fieldById( fields, FR_FIELD_IDS.trademarkNumber ) ).toBeUndefined();
		expect( getFrContactFormLayout( 'individual' ) ).toEqual( [ FR_FIELD_IDS.registrantType ] );
	} );

	it( 'adds the optional organization fields for an organization registrant', () => {
		const fields = getFrContactFormFields( 'organization' );

		expect( fieldById( fields, FR_FIELD_IDS.registrantVatId )?.isValid?.required ).toBeUndefined();
		expect( fieldById( fields, FR_FIELD_IDS.sirenSiret )?.isValid?.required ).toBeUndefined();
		expect( fieldById( fields, FR_FIELD_IDS.trademarkNumber )?.isValid?.required ).toBeUndefined();
		expect( getFrContactFormLayout( 'organization' ) ).toEqual( [
			FR_FIELD_IDS.registrantType,
			FR_FIELD_IDS.registrantVatId,
			FR_FIELD_IDS.sirenSiret,
			FR_FIELD_IDS.trademarkNumber,
		] );
	} );

	it( 'reads nested values out of extra.fr', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: { fr: { registrantType: 'organization', sirenSiret: '123456789' } },
		};

		const fields = getFrContactFormFields( 'organization' );

		expect( fieldById( fields, FR_FIELD_IDS.registrantType )?.getValue?.( { item } ) ).toBe(
			'organization'
		);
		expect( fieldById( fields, FR_FIELD_IDS.sirenSiret )?.getValue?.( { item } ) ).toBe(
			'123456789'
		);
	} );

	it( 'returns the whole extra object on edit so sibling values survive the shallow merge', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: {
				uk: { registrantType: 'IND' },
				fr: { registrantType: 'organization', registrantVatId: 'FRXX123456789' },
			},
		};

		const sirenSiret = fieldById(
			getFrContactFormFields( 'organization' ),
			FR_FIELD_IDS.sirenSiret
		);

		expect( sirenSiret?.setValue?.( { item, value: '123456789' } ) ).toEqual( {
			extra: {
				uk: { registrantType: 'IND' },
				fr: {
					registrantType: 'organization',
					registrantVatId: 'FRXX123456789',
					sirenSiret: '123456789',
				},
			},
		} );
	} );

	it( 'drops the organization values when the registrant switches to individual', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: {
				uk: { registrantType: 'IND' },
				fr: {
					registrantType: 'organization',
					registrantVatId: 'FRXX123456789',
					sirenSiret: '123456789',
					trademarkNumber: '012345678',
				},
			},
		};

		const registrantType = fieldById(
			getFrContactFormFields( 'organization' ),
			FR_FIELD_IDS.registrantType
		);

		// Left behind, they stay on the payload with no control on screen to fix
		// them — and the schema checks their format whatever the registrant type.
		expect( registrantType?.setValue?.( { item, value: 'individual' } ) ).toEqual( {
			extra: { uk: { registrantType: 'IND' }, fr: { registrantType: 'individual' } },
		} );
	} );

	it( 'clears the organization name when the registrant switches to individual', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			organization: 'Some organization name',
			extra: { fr: { registrantType: 'organization' } },
		};

		const registrantType = fieldById(
			getFrContactFormFields( 'organization' ),
			FR_FIELD_IDS.registrantType
		);

		// AFNIC decides legal-entity status by the contact carrying an organization,
		// so leaving the name behind would register the individual as a legal entity.
		expect( registrantType?.setValue?.( { item, value: 'individual' } ) ).toEqual( {
			organization: '',
			extra: { fr: { registrantType: 'individual' } },
		} );
	} );

	it( 'leaves the organization name alone for other registrant type changes', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			organization: 'Some organization name',
			extra: { fr: { registrantType: 'individual' } },
		};

		const registrantType = fieldById(
			getFrContactFormFields( 'individual' ),
			FR_FIELD_IDS.registrantType
		);

		expect( registrantType?.setValue?.( { item, value: 'organization' } ) ).toEqual( {
			extra: { fr: { registrantType: 'organization' } },
		} );
		expect( registrantType?.setValue?.( { item, value: '' } ) ).toEqual( {
			extra: { fr: { registrantType: '' } },
		} );
	} );

	it( 'keeps the organization values when the registrant switches back to organization', () => {
		const item: DomainContactDetails = {
			optOutTransferLock: false,
			extra: { fr: { registrantType: 'individual', sirenSiret: '123456789' } },
		};

		const registrantType = fieldById(
			getFrContactFormFields( 'individual' ),
			FR_FIELD_IDS.registrantType
		);

		expect( registrantType?.setValue?.( { item, value: 'organization' } ) ).toEqual( {
			extra: { fr: { registrantType: 'organization', sirenSiret: '123456789' } },
		} );
	} );

	it( 'sanitizes the VAT number to uppercase alphanumerics as checkout does', () => {
		const field = fieldById(
			getFrContactFormFields( 'organization' ),
			FR_FIELD_IDS.registrantVatId
		);

		expect(
			field?.setValue?.( { item: { optOutTransferLock: false }, value: 'fr xx-123456789' } )
		).toEqual( { extra: { fr: { registrantVatId: 'FRXX123456789' } } } );
	} );

	it( 'strips non-digits from the SIREN/SIRET and trademark numbers', () => {
		const fields = getFrContactFormFields( 'organization' );
		const item: DomainContactDetails = { optOutTransferLock: false };

		expect(
			fieldById( fields, FR_FIELD_IDS.sirenSiret )?.setValue?.( { item, value: '123 456 789' } )
		).toEqual( { extra: { fr: { sirenSiret: '123456789' } } } );
		expect(
			fieldById( fields, FR_FIELD_IDS.trademarkNumber )?.setValue?.( {
				item,
				value: '01-234-5678',
			} )
		).toEqual( { extra: { fr: { trademarkNumber: '012345678' } } } );
	} );

	it( 'accepts a 9-digit SIREN or 14-digit SIRET, or an empty value', () => {
		const field = fieldById( getFrContactFormFields( 'organization' ), FR_FIELD_IDS.sirenSiret );

		const pattern = new RegExp( field?.isValid?.pattern ?? '' );

		expect( pattern.test( '123456789' ) ).toBe( true );
		expect( pattern.test( '12345678901234' ) ).toBe( true );
		expect( pattern.test( '' ) ).toBe( true );
		expect( pattern.test( '12345678' ) ).toBe( false );
		expect( pattern.test( '1234567890' ) ).toBe( false );
	} );

	it( 'accepts a 9-digit trademark number, or an empty value', () => {
		const field = fieldById(
			getFrContactFormFields( 'organization' ),
			FR_FIELD_IDS.trademarkNumber
		);

		const pattern = new RegExp( field?.isValid?.pattern ?? '' );

		expect( pattern.test( '012345678' ) ).toBe( true );
		expect( pattern.test( '' ) ).toBe( true );
		expect( pattern.test( '12345678' ) ).toBe( false );
		expect( pattern.test( '0123456789' ) ).toBe( false );
	} );
} );

describe( 'validateFrOrganization', () => {
	it( 'rejects an organization name on an individual registrant', () => {
		expect(
			validateFrOrganization( {
				optOutTransferLock: false,
				organization: 'Some organization name',
				extra: { fr: { registrantType: 'individual' } },
			} )
		).toEqual( expect.any( String ) );
	} );

	it( 'accepts an individual registrant with no organization name', () => {
		expect(
			validateFrOrganization( {
				optOutTransferLock: false,
				organization: '',
				extra: { fr: { registrantType: 'individual' } },
			} )
		).toBeNull();
	} );

	it( 'accepts an organization registrant with an organization name', () => {
		expect(
			validateFrOrganization( {
				optOutTransferLock: false,
				organization: 'Some organization name',
				extra: { fr: { registrantType: 'organization' } },
			} )
		).toBeNull();
	} );

	it( 'accepts an organization name while no registrant type is selected', () => {
		expect(
			validateFrOrganization( {
				optOutTransferLock: false,
				organization: 'Some organization name',
			} )
		).toBeNull();
	} );
} );

describe( 'withFrOrganizationValidation', () => {
	const normalizedField = {} as Parameters<
		NonNullable< NonNullable< Field< DomainContactDetails >[ 'isValid' ] >[ 'custom' ] >
	>[ 1 ];

	it( 'layers the rule onto the organization field and keeps its existing validator', async () => {
		const baseCustom = jest.fn().mockResolvedValue( 'base error' );
		const fields = withFrOrganizationValidation( [
			{ id: 'organization', type: 'text', isValid: { custom: baseCustom } },
			{ id: 'email', type: 'email' },
		] );

		const conflicted: DomainContactDetails = {
			optOutTransferLock: false,
			organization: 'Some organization name',
			extra: { fr: { registrantType: 'individual' } },
		};
		await expect( fields[ 0 ].isValid?.custom?.( conflicted, normalizedField ) ).resolves.toEqual(
			expect.any( String )
		);
		expect( baseCustom ).not.toHaveBeenCalled();

		const fine: DomainContactDetails = {
			optOutTransferLock: false,
			organization: 'Some organization name',
			extra: { fr: { registrantType: 'organization' } },
		};
		await expect( fields[ 0 ].isValid?.custom?.( fine, normalizedField ) ).resolves.toBe(
			'base error'
		);
	} );

	it( 'leaves other fields untouched', () => {
		const emailField = { id: 'email', type: 'email' } as Field< DomainContactDetails >;

		expect( withFrOrganizationValidation( [ emailField ] )[ 0 ] ).toBe( emailField );
	} );
} );

describe( 'mapWhoisExtraToFrContactExtra', () => {
	it( 'converts the registrar snake_case keys to the form shape', () => {
		expect(
			mapWhoisExtraToFrContactExtra( {
				registrant_type: 'organization',
				registrant_vat_id: 'FRXX123456789',
				siren_siret: '123456789',
				trademark_number: '012345678',
			} )
		).toEqual( {
			registrantType: 'organization',
			registrantVatId: 'FRXX123456789',
			sirenSiret: '123456789',
			trademarkNumber: '012345678',
		} );
	} );

	it( 'omits organization values the registrar has not stored', () => {
		expect( mapWhoisExtraToFrContactExtra( { registrant_type: 'individual' } ) ).toEqual( {
			registrantType: 'individual',
		} );
	} );

	it( 'returns undefined when there is no stored registrant type, rather than guessing one', () => {
		expect( mapWhoisExtraToFrContactExtra( undefined ) ).toBeUndefined();
		expect( mapWhoisExtraToFrContactExtra( {} ) ).toBeUndefined();
		expect( mapWhoisExtraToFrContactExtra( { registrant_type: '' } ) ).toBeUndefined();
	} );
} );
