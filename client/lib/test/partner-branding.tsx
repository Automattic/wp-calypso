/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import {
	getCiabConfigFromCurrentDomain,
	getCiabConfigFromBrandingCode,
	getCiabConfigFromOAuth2Client,
	getCiabConfigFromRedirectUrl,
	getCiabConfigFromGarden,
	detectCiabConfig,
	getPartnerAllowedSocialServices,
	getPartnerSignupTosElement,
	persistCiabPartnerId,
	readPersistedCiabPartnerId,
	clearPersistedCiabPartnerId,
	CIAB_PARTNERS,
} from '../partner-branding';
import type { CiabPartnerConfig } from '../partner-branding';
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
	const originalLocation = window.location;

	function setLocation( hostname: string, search = '' ) {
		Object.defineProperty( window, 'location', {
			value: { hostname, search },
			writable: true,
		} );
	}

	beforeEach( () => {
		clearPersistedCiabPartnerId();
		( config.isEnabled as jest.Mock ).mockImplementation( ( feature: string ) => {
			if ( feature === 'ciab/custom-branding' ) {
				return true;
			}

			return false;
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
		} );
	} );

	describe( 'getCiabConfigFromCurrentDomain', () => {
		test( 'returns partner config when current domain matches', () => {
			setLocation( 'my.woo.ai' );

			const result = getCiabConfigFromCurrentDomain();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when current domain does not match any partner', () => {
			setLocation( 'wordpress.com' );

			const result = getCiabConfigFromCurrentDomain();

			expect( result ).toBeNull();
		} );
	} );

	describe( 'getCiabConfigFromBrandingCode', () => {
		test( 'returns partner config when from param matches a valid partner', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const result = getCiabConfigFromBrandingCode();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when from param does not match any partner', () => {
			setLocation( 'wordpress.com', '?from=unknown' );

			const result = getCiabConfigFromBrandingCode();

			expect( result ).toBeNull();
		} );

		test( 'returns null when from param is absent', () => {
			setLocation( 'wordpress.com' );

			const result = getCiabConfigFromBrandingCode();

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
			const result = getCiabConfigFromRedirectUrl( 'https://my.woo.ai/some/path?foo=bar&baz=1' );

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

	describe( 'getCiabConfigFromOAuth2Client', () => {
		test( 'returns partner config when oauth2Client matches dev ID', () => {
			const result = getCiabConfigFromOAuth2Client( { id: 134404 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns partner config when oauth2Client matches production ID', () => {
			const result = getCiabConfigFromOAuth2Client( { id: 134405 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when oauth2Client does not match any partner', () => {
			const result = getCiabConfigFromOAuth2Client( { id: 99999 } );

			expect( result ).toBeNull();
		} );

		test( 'returns null when oauth2Client is null', () => {
			const result = getCiabConfigFromOAuth2Client( null );

			expect( result ).toBeNull();
		} );

		test( 'returns null when oauth2Client is undefined', () => {
			const result = getCiabConfigFromOAuth2Client( undefined );

			expect( result ).toBeNull();
		} );

		test( 'returns null when feature flag is disabled', () => {
			( config.isEnabled as jest.Mock ).mockReturnValue( false );

			const result = getCiabConfigFromOAuth2Client( { id: 134404 } );

			expect( result ).toBeNull();
		} );
	} );

	describe( 'detectCiabConfig — precedence', () => {
		test( 'hostname wins over conflicting from query param', () => {
			setLocation( 'my.woo.ai', '?from=other' );

			const result = detectCiabConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'hostname wins over conflicting redirect_to', () => {
			setLocation( 'my.woo.ai', '?redirect_to=https://example.com' );

			const result = detectCiabConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'from=woo still works when hostname does not match', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const result = detectCiabConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'from wins over redirect_to when conflicting', () => {
			setLocation( 'wordpress.com', '?from=woo&redirect_to=https://example.com' );

			const result = detectCiabConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'from wins over oauth2Client when conflicting', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const result = detectCiabConfig( { id: 99999 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'oauth2Client matching still works when no hostname or from match', () => {
			setLocation( 'wordpress.com' );

			const result = detectCiabConfig( { id: 134404 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'oauth2Client wins over redirect_to when conflicting', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://example.com' );

			const result = detectCiabConfig( { id: 134405 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'redirect_to matching still works when no hostname or from match', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://my.woo.ai/dashboard' );

			const result = detectCiabConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when nothing matches', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://example.com' );

			const result = detectCiabConfig();

			expect( result ).toBeNull();
		} );

		test( 'returns null when no query params are present', () => {
			setLocation( 'wordpress.com' );

			const result = detectCiabConfig();

			expect( result ).toBeNull();
		} );
	} );

	describe( 'session persistence', () => {
		test( 'persists and reads partner id', () => {
			persistCiabPartnerId( 'woo' );

			expect( readPersistedCiabPartnerId() ).toBe( 'woo' );
		} );

		test( 'detectCiabConfig persists partner when detected', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			detectCiabConfig();

			expect( readPersistedCiabPartnerId() ).toBe( 'woo' );
		} );

		test( 'detectCiabConfig uses persisted partner when nothing else matches', () => {
			persistCiabPartnerId( 'woo' );
			setLocation( 'wordpress.com' );

			const result = detectCiabConfig();

			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'detectCiabConfig clears persisted partner when feature flag is disabled', () => {
			persistCiabPartnerId( 'woo' );
			( config.isEnabled as jest.Mock ).mockReturnValue( false );
			setLocation( 'wordpress.com' );

			const result = detectCiabConfig();

			expect( result ).toBeNull();
			expect( readPersistedCiabPartnerId() ).toBeNull();
		} );
	} );

	describe( 'getPartnerAllowedSocialServices', () => {
		test( 'returns ssoProviders array when from param matches partner', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const services = getPartnerAllowedSocialServices();

			expect( services ).toEqual( CIAB_PARTNERS.woo.ssoProviders );
		} );

		test( 'returns ssoProviders array when redirect URL matches partner', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://my.woo.ai/dashboard' );

			const services = getPartnerAllowedSocialServices();

			expect( services ).toEqual( CIAB_PARTNERS.woo.ssoProviders );
		} );

		test( 'returns null when nothing matches', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://example.com' );

			const services = getPartnerAllowedSocialServices();

			expect( services ).toBeNull();
		} );

		test( 'returns null when no query params', () => {
			setLocation( 'wordpress.com' );

			const services = getPartnerAllowedSocialServices();

			expect( services ).toBeNull();
		} );
	} );

	describe( 'getCiabConfigFromGarden', () => {
		test( 'returns woo config for commerce garden partner mapping', () => {
			const result = getCiabConfigFromGarden( 'woo', 'commerce' );

			expect( result ).toEqual( CIAB_PARTNERS.woo );
		} );

		test( 'returns null for unsupported garden mapping', () => {
			const result = getCiabConfigFromGarden( 'woo', 'unknown' );

			expect( result ).toBeNull();
		} );

		test( 'persists partner id when requested', () => {
			getCiabConfigFromGarden( 'woo', 'commerce', { persistToSession: true } );

			expect( readPersistedCiabPartnerId() ).toBe( 'woo' );
		} );
	} );

	describe( 'getPartnerSignupTosElement', () => {
		const mockTranslate = ( ( original: string ) => original ) as ReturnType< typeof useTranslate >;

		test( 'returns a ToS element for supported partners', () => {
			const tosElement = getPartnerSignupTosElement( CIAB_PARTNERS.woo, mockTranslate );

			expect( tosElement ).toBeDefined();
			render( <>{ tosElement }</> );
			expect( screen.getByText( /WordPress.com is used to manage your account\./ ) ).toBeVisible();
		} );

		test( 'returns undefined when no partner config is provided', () => {
			const tosElement = getPartnerSignupTosElement( null, mockTranslate );

			expect( tosElement ).toBeUndefined();
		} );
	} );

	describe( 'partner without featureFlag is always active', () => {
		const testPartner: CiabPartnerConfig = {
			id: 'test-no-flag',
			displayName: 'Test',
			logo: { src: 'test.svg', alt: 'Test' },
			ssoProviders: [ 'google' ],
			domains: [ 'test.example.com' ],
		};

		beforeEach( () => {
			( CIAB_PARTNERS as Record< string, CiabPartnerConfig > )[ 'test-no-flag' ] = testPartner;
		} );

		afterEach( () => {
			delete ( CIAB_PARTNERS as Record< string, CiabPartnerConfig > )[ 'test-no-flag' ];
		} );

		test( 'getCiabConfigFromCurrentDomain returns partner even when all feature flags are disabled', () => {
			( config.isEnabled as jest.Mock ).mockReturnValue( false );
			setLocation( 'test.example.com' );

			const result = getCiabConfigFromCurrentDomain();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'test-no-flag' );
		} );

		test( 'getCiabConfigFromBrandingCode returns partner even when all feature flags are disabled', () => {
			( config.isEnabled as jest.Mock ).mockReturnValue( false );
			setLocation( 'wordpress.com', '?from=test-no-flag' );

			const result = getCiabConfigFromBrandingCode();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'test-no-flag' );
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
