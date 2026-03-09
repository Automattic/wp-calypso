/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import {
	CIAB_PARTNERS,
	clearPersistedCiabPartnerId,
	getEffectiveCiabConfig,
	getEffectivePartnerAllowedSocialServices,
	getCiabConfig,
	getCiabConfigFromGarden,
	getPartnerAllowedSocialServices,
	getPartnerSignupTosElement,
	persistCiabPartnerId,
	readPersistedCiabPartnerId,
} from '../partner-branding';
import type { useTranslate } from 'i18n-calypso';

// Mock the config module
jest.mock( '@automattic/calypso-config', () => {
	const config = () => null;
	config.isEnabled = jest.fn( ( feature: string ) => {
		if ( feature === 'ciab/custom-branding' ) {
			return true;
		}
		return false;
	} );
	return config;
} );

describe( 'partner-branding', () => {
	beforeEach( () => {
		clearPersistedCiabPartnerId();
		( config.isEnabled as jest.Mock ).mockImplementation( ( feature: string ) => {
			if ( feature === 'ciab/custom-branding' ) {
				return true;
			}

			return false;
		} );
	} );

	describe( 'getCiabConfig', () => {
		test( 'returns partner config when from param matches a valid partner', () => {
			const config = getCiabConfig( 'woo' );

			expect( config ).not.toBeNull();
			expect( config?.id ).toBe( 'woo' );
			expect( config?.displayName ).toBe( 'Woo' );
		} );

		test( 'returns null when from param does not match any partner', () => {
			const config = getCiabConfig( 'unknown-partner' );

			expect( config ).toBeNull();
		} );

		test( 'returns null when from param is undefined', () => {
			const config = getCiabConfig( undefined );

			expect( config ).toBeNull();
		} );

		test( 'handles array of from params by using first value', () => {
			const config = getCiabConfig( [ 'woo', 'other' ] );

			expect( config ).not.toBeNull();
			expect( config?.id ).toBe( 'woo' );
		} );
	} );

	describe( 'getPartnerAllowedSocialServices', () => {
		test( 'returns ssoProviders array for valid partner', () => {
			const services = getPartnerAllowedSocialServices( 'woo' );

			expect( services ).toEqual( CIAB_PARTNERS.woo.ssoProviders );
		} );

		test( 'returns null for unknown partner', () => {
			const services = getPartnerAllowedSocialServices( 'unknown' );

			expect( services ).toBeNull();
		} );

		test( 'returns null when from is undefined', () => {
			const services = getPartnerAllowedSocialServices( undefined );

			expect( services ).toBeNull();
		} );
	} );

	describe( 'getCiabConfigFromGarden', () => {
		test( 'returns woo config for commerce garden partner mapping', () => {
			const config = getCiabConfigFromGarden( 'woo', 'commerce' );

			expect( config ).toEqual( CIAB_PARTNERS.woo );
		} );

		test( 'returns null for unsupported garden mapping', () => {
			const config = getCiabConfigFromGarden( 'woo', 'unknown' );

			expect( config ).toBeNull();
		} );

		test( 'persists partner id when requested', () => {
			getCiabConfigFromGarden( 'woo', 'commerce', { persistToSession: true } );

			expect( readPersistedCiabPartnerId() ).toBe( 'woo' );
		} );
	} );

	describe( 'session persistence', () => {
		test( 'persists and reads partner id', () => {
			persistCiabPartnerId( 'woo' );

			expect( readPersistedCiabPartnerId() ).toBe( 'woo' );
		} );

		test( 'uses current from when present and persists it', () => {
			const config = getEffectiveCiabConfig( 'woo', undefined );

			expect( config?.id ).toBe( 'woo' );
			expect( readPersistedCiabPartnerId() ).toBe( 'woo' );
		} );

		test( 'uses persisted partner when from params are missing', () => {
			persistCiabPartnerId( 'woo' );

			const config = getEffectiveCiabConfig( undefined, undefined );

			expect( config?.id ).toBe( 'woo' );
		} );

		test( 'clears persisted partner when current from is invalid', () => {
			persistCiabPartnerId( 'woo' );

			const config = getEffectiveCiabConfig( 'unknown', undefined );

			expect( config ).toBeNull();
			expect( readPersistedCiabPartnerId() ).toBeNull();
		} );

		test( 'clears persisted partner when feature flag is disabled', () => {
			persistCiabPartnerId( 'woo' );
			( config.isEnabled as jest.Mock ).mockReturnValue( false );

			const effectiveConfig = getEffectiveCiabConfig( undefined, undefined );

			expect( effectiveConfig ).toBeNull();
			expect( readPersistedCiabPartnerId() ).toBeNull();
		} );

		test( 'returns social services from persisted partner', () => {
			persistCiabPartnerId( 'woo' );

			const services = getEffectivePartnerAllowedSocialServices( undefined, undefined );

			expect( services ).toEqual( CIAB_PARTNERS.woo.ssoProviders );
		} );
	} );

	describe( 'getPartnerSignupTosElement', () => {
		const mockTranslate = ( ( original: string ) => original ) as ReturnType< typeof useTranslate >;

		test( 'returns a ToS element for supported partners', () => {
			const tosElement = getPartnerSignupTosElement( CIAB_PARTNERS.woo, mockTranslate );

			expect( tosElement ).toBeDefined();
		} );

		test( 'returns undefined when no partner config is provided', () => {
			const tosElement = getPartnerSignupTosElement( null, mockTranslate );

			expect( tosElement ).toBeUndefined();
		} );
	} );

	describe( 'CIAB_PARTNERS', () => {
		test( 'woo partner has required configuration', () => {
			const wooConfig = CIAB_PARTNERS.woo;

			expect( wooConfig ).toBeDefined();
			expect( wooConfig.id ).toBe( 'woo' );
			expect( wooConfig.displayName ).toBe( 'Woo' );
			expect( wooConfig.featureFlag ).toBe( 'ciab/custom-branding' );
			expect( wooConfig.logo ).toBeDefined();
			expect( wooConfig.logo.src ).toBeDefined();
			expect( wooConfig.ssoProviders ).toBeInstanceOf( Array );
			expect( wooConfig.ssoProviders.length ).toBeGreaterThan( 0 );
		} );
	} );
} );
