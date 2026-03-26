/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import {
	getPartnerConfigFromCurrentDomain,
	getPartnerConfigFromBrandingCode,
	getPartnerConfigFromOAuth2Client,
	getPartnerConfigFromRedirectUrl,
	getPartnerConfigFromGarden,
	detectPartnerConfig,
	getPartnerAllowedSocialServices,
	getPartnerSignupTosElement,
	getPartnerWindowTitleSuffix,
	getPartnerFormattedWindowTitle,
	persistPartnerId,
	readPersistedPartnerId,
	clearPersistedPartnerId,
	PARTNERS,
} from '../partner-branding';
import type { PartnerConfig } from '../partner-branding';
import type { useTranslate } from 'i18n-calypso';

// Mock the config module
jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		if ( key === 'site_name' ) {
			return 'WordPress.com';
		}

		return null;
	};
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
		clearPersistedPartnerId();
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

	describe( 'getPartnerConfigFromCurrentDomain', () => {
		test( 'returns partner config when current domain matches', () => {
			setLocation( 'my.woo.ai' );

			const result = getPartnerConfigFromCurrentDomain();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when current domain does not match any partner', () => {
			setLocation( 'wordpress.com' );

			const result = getPartnerConfigFromCurrentDomain();

			expect( result ).toBeNull();
		} );
	} );

	describe( 'getPartnerConfigFromBrandingCode', () => {
		test( 'returns partner config when from param matches a valid partner', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const result = getPartnerConfigFromBrandingCode();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when from param does not match any partner', () => {
			setLocation( 'wordpress.com', '?from=unknown' );

			const result = getPartnerConfigFromBrandingCode();

			expect( result ).toBeNull();
		} );

		test( 'returns null when from param is absent', () => {
			setLocation( 'wordpress.com' );

			const result = getPartnerConfigFromBrandingCode();

			expect( result ).toBeNull();
		} );
	} );

	describe( 'getPartnerConfigFromRedirectUrl', () => {
		test( 'returns partner config when redirect URL hostname matches a partner domain', () => {
			const result = getPartnerConfigFromRedirectUrl( 'https://my.woo.ai/dashboard' );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns partner config when redirect URL has path and query params', () => {
			const result = getPartnerConfigFromRedirectUrl( 'https://my.woo.ai/some/path?foo=bar&baz=1' );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when redirect URL hostname does not match any partner', () => {
			const result = getPartnerConfigFromRedirectUrl( 'https://example.com/dashboard' );

			expect( result ).toBeNull();
		} );

		test( 'returns null when redirect URL is undefined', () => {
			const result = getPartnerConfigFromRedirectUrl( undefined );

			expect( result ).toBeNull();
		} );

		test( 'returns null when redirect URL is an invalid URL', () => {
			const result = getPartnerConfigFromRedirectUrl( 'not-a-url' );

			expect( result ).toBeNull();
		} );

		test( 'handles array of redirect URLs by using first value', () => {
			const result = getPartnerConfigFromRedirectUrl( [
				'https://my.woo.ai/dashboard',
				'https://example.com',
			] );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'does not match subdomains of partner domains', () => {
			const result = getPartnerConfigFromRedirectUrl( 'https://sub.my.woo.ai/dashboard' );

			expect( result ).toBeNull();
		} );
	} );

	describe( 'getPartnerConfigFromOAuth2Client', () => {
		test( 'returns partner config when oauth2Client matches dev ID', () => {
			const result = getPartnerConfigFromOAuth2Client( { id: 134404 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns partner config when oauth2Client matches production ID', () => {
			const result = getPartnerConfigFromOAuth2Client( { id: 134405 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when oauth2Client does not match any partner', () => {
			const result = getPartnerConfigFromOAuth2Client( { id: 99999 } );

			expect( result ).toBeNull();
		} );

		test( 'returns null when oauth2Client is null', () => {
			const result = getPartnerConfigFromOAuth2Client( null );

			expect( result ).toBeNull();
		} );

		test( 'returns null when oauth2Client is undefined', () => {
			const result = getPartnerConfigFromOAuth2Client( undefined );

			expect( result ).toBeNull();
		} );

		test( 'returns null when feature flag is disabled', () => {
			( config.isEnabled as jest.Mock ).mockReturnValue( false );

			const result = getPartnerConfigFromOAuth2Client( { id: 134404 } );

			expect( result ).toBeNull();
		} );
	} );

	describe( 'detectPartnerConfig — precedence', () => {
		test( 'hostname wins over conflicting from query param', () => {
			setLocation( 'my.woo.ai', '?from=other' );

			const result = detectPartnerConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'hostname wins over conflicting redirect_to', () => {
			setLocation( 'my.woo.ai', '?redirect_to=https://example.com' );

			const result = detectPartnerConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'from=woo still works when hostname does not match', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const result = detectPartnerConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'from wins over redirect_to when conflicting', () => {
			setLocation( 'wordpress.com', '?from=woo&redirect_to=https://example.com' );

			const result = detectPartnerConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'from wins over oauth2Client when conflicting', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const result = detectPartnerConfig( { id: 99999 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'oauth2Client matching still works when no hostname or from match', () => {
			setLocation( 'wordpress.com' );

			const result = detectPartnerConfig( { id: 134404 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'oauth2Client wins over redirect_to when conflicting', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://example.com' );

			const result = detectPartnerConfig( { id: 134405 } );

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'redirect_to matching still works when no hostname or from match', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://my.woo.ai/dashboard' );

			const result = detectPartnerConfig();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'returns null when nothing matches', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://example.com' );

			const result = detectPartnerConfig();

			expect( result ).toBeNull();
		} );

		test( 'returns null when no query params are present', () => {
			setLocation( 'wordpress.com' );

			const result = detectPartnerConfig();

			expect( result ).toBeNull();
		} );
	} );

	describe( 'session persistence', () => {
		test( 'persists and reads partner id', () => {
			persistPartnerId( 'woo' );

			expect( readPersistedPartnerId() ).toBe( 'woo' );
		} );

		test( 'detectPartnerConfig persists partner when detected', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			detectPartnerConfig();

			expect( readPersistedPartnerId() ).toBe( 'woo' );
		} );

		test( 'detectPartnerConfig uses persisted partner when nothing else matches', () => {
			persistPartnerId( 'woo' );
			setLocation( 'wordpress.com' );

			const result = detectPartnerConfig();

			expect( result?.id ).toBe( 'woo' );
		} );

		test( 'detectPartnerConfig clears persisted partner when feature flag is disabled', () => {
			persistPartnerId( 'woo' );
			( config.isEnabled as jest.Mock ).mockReturnValue( false );
			setLocation( 'wordpress.com' );

			const result = detectPartnerConfig();

			expect( result ).toBeNull();
			expect( readPersistedPartnerId() ).toBeNull();
		} );

		test( 'reads legacy session key once and migrates to the partner key', () => {
			window.sessionStorage.setItem( 'calypso.ciab.partner-id', 'woo' );

			expect( readPersistedPartnerId() ).toBe( 'woo' );
			expect( window.sessionStorage.getItem( 'calypso.partner.partner-id' ) ).toBe( 'woo' );
			expect( window.sessionStorage.getItem( 'calypso.ciab.partner-id' ) ).toBeNull();
		} );
	} );

	describe( 'getPartnerAllowedSocialServices', () => {
		test( 'returns ssoProviders array when from param matches partner', () => {
			setLocation( 'wordpress.com', '?from=woo' );

			const services = getPartnerAllowedSocialServices();

			expect( services ).toEqual( PARTNERS.woo.ssoProviders );
		} );

		test( 'returns ssoProviders array when redirect URL matches partner', () => {
			setLocation( 'wordpress.com', '?redirect_to=https://my.woo.ai/dashboard' );

			const services = getPartnerAllowedSocialServices();

			expect( services ).toEqual( PARTNERS.woo.ssoProviders );
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

	describe( 'getPartnerConfigFromGarden', () => {
		test( 'returns woo config for commerce garden partner mapping', () => {
			const result = getPartnerConfigFromGarden( 'woo', 'commerce' );

			expect( result ).toEqual( PARTNERS.woo );
		} );

		test( 'returns null for unsupported garden mapping', () => {
			const result = getPartnerConfigFromGarden( 'woo', 'unknown' );

			expect( result ).toBeNull();
		} );

		test( 'persists partner id when requested', () => {
			getPartnerConfigFromGarden( 'woo', 'commerce', { persistToSession: true } );

			expect( readPersistedPartnerId() ).toBe( 'woo' );
		} );
	} );

	describe( 'getPartnerSignupTosElement', () => {
		const mockTranslate = ( ( original: string ) => original ) as ReturnType< typeof useTranslate >;

		test( 'returns a ToS element for supported partners', () => {
			const tosElement = getPartnerSignupTosElement( PARTNERS.woo, mockTranslate );

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
		const testPartner: PartnerConfig = {
			id: 'test-no-flag',
			displayName: 'Test',
			logo: { src: 'test.svg', alt: 'Test' },
			ssoProviders: [ 'google' ],
			domains: [ 'test.example.com' ],
		};

		beforeEach( () => {
			( PARTNERS as Record< string, PartnerConfig > )[ 'test-no-flag' ] = testPartner;
		} );

		afterEach( () => {
			delete ( PARTNERS as Record< string, PartnerConfig > )[ 'test-no-flag' ];
		} );

		test( 'getPartnerConfigFromCurrentDomain returns partner even when all feature flags are disabled', () => {
			( config.isEnabled as jest.Mock ).mockReturnValue( false );
			setLocation( 'test.example.com' );

			const result = getPartnerConfigFromCurrentDomain();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'test-no-flag' );
		} );

		test( 'getPartnerConfigFromBrandingCode returns partner even when all feature flags are disabled', () => {
			( config.isEnabled as jest.Mock ).mockReturnValue( false );
			setLocation( 'wordpress.com', '?from=test-no-flag' );

			const result = getPartnerConfigFromBrandingCode();

			expect( result ).not.toBeNull();
			expect( result?.id ).toBe( 'test-no-flag' );
		} );
	} );

	describe( 'PARTNERS', () => {
		test( 'woo partner has required configuration', () => {
			const wooConfig = PARTNERS.woo;

			expect( wooConfig ).toBeDefined();
			expect( wooConfig.id ).toBe( 'woo' );
			expect( wooConfig.displayName ).toBe( 'Woo' );
			expect( wooConfig.featureFlag ).toBe( 'ciab/custom-branding' );
			expect( wooConfig.logo ).toBeDefined();
			expect( wooConfig.logo.src ).toBeDefined();
			expect( wooConfig.ssoProviders ).toBeInstanceOf( Array );
			expect( wooConfig.ssoProviders.length ).toBeGreaterThan( 0 );
			expect( wooConfig.windowTitleSuffix ).toBe( 'Woo' );
			expect( wooConfig.domains ).toContain( 'my.woo.ai' );
		} );
	} );

	describe( 'window title helpers', () => {
		test( 'returns partner-specific suffix when available', () => {
			expect( getPartnerWindowTitleSuffix( PARTNERS.woo ) ).toBe( 'Woo' );
		} );

		test( 'falls back to site_name when partner suffix is unavailable', () => {
			expect( getPartnerWindowTitleSuffix( null ) ).toBe( 'WordPress.com' );
		} );

		test( 'formats title with partner-aware suffix', () => {
			expect( getPartnerFormattedWindowTitle( 'Accept Invite', PARTNERS.woo ) ).toBe(
				'Accept Invite — Woo'
			);
		} );

		test( 'formats title with default suffix when no partner is detected', () => {
			expect( getPartnerFormattedWindowTitle( 'Accept Invite', null ) ).toBe(
				'Accept Invite — WordPress.com'
			);
		} );
	} );
} );
