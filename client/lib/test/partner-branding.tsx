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
	getCiabConfigFromCurrentDomain,
	getCiabConfigFromRedirectUrl,
	getCiabConfigFromGarden,
	detectCiabConfig,
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

	describe( 'getCiabConfigFromCurrentDomain', () => {
		const originalLocation = window.location;

		afterEach( () => {
			Object.defineProperty( window, 'location', {
				value: originalLocation,
				writable: true,
			} );
		} );

		test( 'returns partner config when current domain matches', () => {
			Object.defineProperty( window, 'location', {
				value: { hostname: 'my.woo.ai' },
				writable: true,
			} );

			const result = getCiabConfigFromCurrentDomain();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when current domain does not match any partner', () => {
			Object.defineProperty( window, 'location', {
				value: { hostname: 'wordpress.com' },
				writable: true,
			} );

			const result = getCiabConfigFromCurrentDomain();

			expect( result ).toBeNull();
		} );
	} );

	describe( 'getCiabConfigFromRedirectUrl', () => {
		test( 'returns partner config when redirect URL hostname matches a partner domain', () => {
			const result = getCiabConfigFromRedirectUrl( 'https://my.woo.ai/dashboard' );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns partner config when redirect URL has path and query params', () => {
			const result = getCiabConfigFromRedirectUrl(
				'https://my.woo.ai/some/path?foo=bar&baz=1'
			);

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when redirect URL hostname does not match any partner', () => {
			const result = getCiabConfigFromRedirectUrl( 'https://example.com/dashboard' );

			expect( result ).toBeNull();
		} );

		test( 'returns null when redirect URL is undefined', () => {
			const result = getCiabConfigFromRedirectUrl( undefined );

			expect( result ).toBeNull();
		} );

		test( 'returns null when redirect URL is an invalid URL', () => {
			const result = getCiabConfigFromRedirectUrl( 'not-a-url' );

			expect( result ).toBeNull();
		} );

		test( 'handles array of redirect URLs by using first value', () => {
			const result = getCiabConfigFromRedirectUrl( [
				'https://my.woo.ai/dashboard',
				'https://example.com',
			] );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'does not match subdomains of partner domains', () => {
			const result = getCiabConfigFromRedirectUrl( 'https://sub.my.woo.ai/dashboard' );

			expect( result ).toBeNull();
		} );
	} );

	describe( 'detectCiabConfig', () => {
		test( 'detects from redirect_to param', () => {
			const result = detectCiabConfig( 'https://my.woo.ai/dashboard' );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'detects from oauth2_redirect param', () => {
			const result = detectCiabConfig( undefined, 'https://my.woo.ai/dashboard' );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'prefers redirect_to over oauth2_redirect', () => {
			const result = detectCiabConfig(
				'https://my.woo.ai/from-redirect',
				'https://example.com/from-oauth'
			);

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when no params match', () => {
			const result = detectCiabConfig( 'https://example.com', 'https://other.com' );

			expect( result ).toBeNull();
		} );

		test( 'returns null when both params are undefined', () => {
			const result = detectCiabConfig( undefined, undefined );

			expect( result ).toBeNull();
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
			expect( wooConfig.domains ).toContain( 'my.woo.ai' );
		} );
	} );
} );
