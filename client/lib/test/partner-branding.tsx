/**
 * @jest-environment jsdom
 */
import { getCiabConfig, getPartnerAllowedSocialServices, CIAB_PARTNERS } from '../partner-branding';

// Mock the config module
jest.mock( '@automattic/calypso-config', () => {
	const config = () => null;
	config.isEnabled = ( feature: string ) => {
		if ( feature === 'ciab/custom-branding' ) {
			return true;
		}
		return false;
	};
	return config;
} );

describe( 'partner-branding', () => {
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
