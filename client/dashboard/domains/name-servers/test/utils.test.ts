/**
 * @jest-environment node
 */
import { validateHostname, shouldShowUpsellNudge } from '../utils';
import type { Domain, User, Site } from '@automattic/api-core';

describe( 'name-servers utils', () => {
	describe( 'validateHostname', () => {
		it( 'returns true for a valid hostname', () => {
			expect( validateHostname( 'ns1.example.com' ) ).toBe( true );
		} );

		it( 'returns true for a valid hostname with multiple subdomains', () => {
			expect( validateHostname( 'ns1.sub.example.com' ) ).toBe( true );
		} );

		it( 'returns true for a hostname with numbers', () => {
			expect( validateHostname( 'ns1.example123.com' ) ).toBe( true );
		} );

		it( 'returns true for a hostname with hyphens', () => {
			expect( validateHostname( 'ns-1.example-domain.com' ) ).toBe( true );
		} );

		it( 'returns true for different TLDs', () => {
			expect( validateHostname( 'ns1.example.org' ) ).toBe( true );
			expect( validateHostname( 'ns1.example.net' ) ).toBe( true );
			expect( validateHostname( 'ns1.example.co.uk' ) ).toBe( true );
		} );

		it( 'returns false for an empty string', () => {
			expect( validateHostname( '' ) ).toBe( false );
		} );

		it( 'returns false for a hostname with special characters', () => {
			expect( validateHostname( 'ns1.example!.com' ) ).toBe( false );
			expect( validateHostname( 'ns1.example@.com' ) ).toBe( false );
			expect( validateHostname( 'ns1.example#.com' ) ).toBe( false );
		} );

		it( 'returns false for a hostname starting with a hyphen', () => {
			expect( validateHostname( '-ns1.example.com' ) ).toBe( false );
		} );

		it( 'returns false for a hostname ending with a hyphen', () => {
			expect( validateHostname( 'ns1-.example.com' ) ).toBe( false );
		} );

		it( 'returns true for a hostname without a traditional TLD (two-letter minimum)', () => {
			// "example" is 7 characters which satisfies the TLD requirement of 2+ chars
			expect( validateHostname( 'ns1.example' ) ).toBe( true );
		} );

		it( 'returns false for a hostname with single character TLD', () => {
			expect( validateHostname( 'ns1.example.a' ) ).toBe( false );
		} );

		it( 'returns false for a hostname with spaces', () => {
			expect( validateHostname( 'ns1 .example.com' ) ).toBe( false );
			expect( validateHostname( 'ns1.example .com' ) ).toBe( false );
		} );

		it( 'returns false for an IP address', () => {
			expect( validateHostname( '192.168.1.1' ) ).toBe( false );
		} );

		it( 'returns false for a single word', () => {
			expect( validateHostname( 'localhost' ) ).toBe( false );
		} );

		it( 'returns false for a hostname with consecutive dots', () => {
			expect( validateHostname( 'ns1..example.com' ) ).toBe( false );
		} );

		it( 'returns false for a hostname with underscores', () => {
			expect( validateHostname( 'ns_1.example.com' ) ).toBe( false );
		} );
	} );

	describe( 'shouldShowUpsellNudge', () => {
		const createMockUser = ( hasFlag: boolean ): User =>
			( {
				meta: {
					data: {
						flags: {
							active_flags: hasFlag ? [ 'calypso_allow_nonprimary_domains_without_plan' ] : [],
						},
					},
				},
			} ) as unknown as User;

		const createMockDomain = ( overrides: Partial< Domain > = {} ): Domain =>
			( {
				primary_domain: false,
				is_domain_only_site: false,
				...overrides,
			} ) as Domain;

		const createMockSite = ( overrides: Partial< Site > = {} ): Site =>
			( {
				plan: {
					is_free: true,
				},
				...overrides,
			} ) as Site;

		it( 'returns true when all conditions are met for showing upsell', () => {
			const user = createMockUser( true );
			const domain = createMockDomain();
			const site = createMockSite();

			expect( shouldShowUpsellNudge( user, domain, site ) ).toBe( true );
		} );

		it( 'returns false when site has a paid plan', () => {
			const user = createMockUser( true );
			const domain = createMockDomain();
			const site = createMockSite( { plan: { is_free: false } } as Partial< Site > );

			expect( shouldShowUpsellNudge( user, domain, site ) ).toBe( false );
		} );

		it( 'returns false when user does not have the feature flag', () => {
			const user = createMockUser( false );
			const domain = createMockDomain();
			const site = createMockSite();

			expect( shouldShowUpsellNudge( user, domain, site ) ).toBe( false );
		} );

		it( 'returns false when domain is the primary domain', () => {
			const user = createMockUser( true );
			const domain = createMockDomain( { primary_domain: true } );
			const site = createMockSite();

			expect( shouldShowUpsellNudge( user, domain, site ) ).toBe( false );
		} );

		it( 'returns false when domain is on a domain-only site', () => {
			const user = createMockUser( true );
			const domain = createMockDomain( { is_domain_only_site: true } );
			const site = createMockSite();

			expect( shouldShowUpsellNudge( user, domain, site ) ).toBe( false );
		} );

		it( 'returns false when site is undefined', () => {
			const user = createMockUser( true );
			const domain = createMockDomain();

			expect( shouldShowUpsellNudge( user, domain, undefined ) ).toBe( false );
		} );

		it( 'returns false when site plan is undefined', () => {
			const user = createMockUser( true );
			const domain = createMockDomain();
			const site = {} as Site;

			expect( shouldShowUpsellNudge( user, domain, site ) ).toBe( false );
		} );

		it( 'returns false when multiple conditions are not met', () => {
			const user = createMockUser( false );
			const domain = createMockDomain( { primary_domain: true, is_domain_only_site: true } );
			const site = createMockSite( { plan: { is_free: false } } as Partial< Site > );

			expect( shouldShowUpsellNudge( user, domain, site ) ).toBe( false );
		} );
	} );
} );
