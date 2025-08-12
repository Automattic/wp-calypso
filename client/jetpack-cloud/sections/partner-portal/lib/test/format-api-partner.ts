// @ts-nocheck - TODO: Fix TypeScript issues
import { APIPartner } from 'calypso/state/partner-portal/types';
import formatApiPartner from '../format-api-partner';

const TEST_API_PARTNER: APIPartner = {
	id: -4,
	slug: 'slugbug',
	name: 'John Jacob Jingleheimer-Schmidt',
	contact_person: 'different dude, same name',
	company_website: 'https://example.horse/',
	address: {
		country: 'Portlandia',
		city: 'I dunno, somewhere',
		line1: '',
		line2: '',
		postal_code: '0000000',
		state: 'delirium',
	},
	keys: [
		{
			id: 72,
			name: 'my name',
			oauth2_token: 'secret-token-1234',
			disabled_on: null,
			has_licenses: true,
			latest_invoice: null,
		},
	],
	tos: 'my tos',
	partner_type: 'my partner_type value',
	has_valid_payment_method: false,
	company_type: '',
	managed_sites: '',
};

describe( 'formatApiPartner', () => {
	it( 'returns all passed-in properties/values (except keys) as part of the result', () => {
		const result = formatApiPartner( TEST_API_PARTNER );

		expect( result.id ).toBe( TEST_API_PARTNER.id );
		expect( result.slug ).toBe( TEST_API_PARTNER.slug );
		expect( result.name ).toBe( TEST_API_PARTNER.name );
		expect( result.contact_person ).toBe( TEST_API_PARTNER.contact_person );
		expect( result.company_website ).toBe( TEST_API_PARTNER.company_website );
		expect( result.address ).toBe( TEST_API_PARTNER.address );
		expect( result.tos ).toBe( TEST_API_PARTNER.tos );
		expect( result.partner_type ).toBe( TEST_API_PARTNER.partner_type );
		expect( result.has_valid_payment_method ).toBe( TEST_API_PARTNER.has_valid_payment_method );
	} );

	it( 'renames all key fields from snake_case to camelCase', () => {
		const { keys } = formatApiPartner( TEST_API_PARTNER );

		expect( keys.length ).toBe( TEST_API_PARTNER.keys.length );

		const actualKey = keys[ 0 ];
		expect( actualKey ).not.toHaveProperty( 'oauth2_token' );
		expect( actualKey ).not.toHaveProperty( 'disabled_on' );
		expect( actualKey ).not.toHaveProperty( 'has_licenses' );

		const expectedKeyValues = TEST_API_PARTNER.keys[ 0 ];
		expect( actualKey.id ).toBe( expectedKeyValues.id );
		expect( actualKey.name ).toBe( expectedKeyValues.name );
		expect( actualKey.oAuth2Token ).toBe( expectedKeyValues.oauth2_token );
		expect( actualKey.disabledOn ).toBe( expectedKeyValues.disabled_on );
		expect( actualKey.hasLicenses ).toBe( expectedKeyValues.has_licenses );
	} );
} );
