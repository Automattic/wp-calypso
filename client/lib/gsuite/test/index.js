/**
 * Internal dependencies
 */
import {
	canDomainAddGSuite,
	canUserPurchaseGSuite,
	getAnnualPrice,
	getEligibleGSuiteDomain,
	getGSuiteSupportedDomains,
	getMonthlyPrice,
	hasGSuiteSupportedDomain,
	hasGSuiteWithUs,
	hasPendingGSuiteUsers,
} from 'calypso/lib/gsuite';

jest.mock( 'calypso/lib/user/', () => {
	return () => {
		return {
			get: () => {
				return { is_valid_google_apps_country: true };
			},
		};
	};
} );

describe( 'index', () => {
	describe( '#canDomainAddGSuite', () => {
		test( 'returns true when domain is valid', () => {
			expect( canDomainAddGSuite( 'foobar.blog' ) ).toEqual( true );
		} );

		test( 'returns false when domain is invalid', () => {
			expect( canDomainAddGSuite( 'foobar.wpcomstaging.com' ) ).toEqual( false );
		} );
	} );

	describe( '#getAnnualPrice', () => {
		test( 'returns default value when no parameter provided', () => {
			expect( getAnnualPrice() ).toEqual( '-' );
		} );

		test( 'returns default value when only default value provided', () => {
			expect( getAnnualPrice( null, null, '' ) ).toEqual( '' );
		} );

		test( 'returns valid monthly price when cost is integer', () => {
			expect( getAnnualPrice( 120, 'EUR' ) ).toEqual( '€120' );
		} );

		test( 'returns valid monthly price when cost is float', () => {
			expect( getAnnualPrice( 99.99, 'USD' ) ).toEqual( '$99.99' );
		} );
	} );

	describe( '#getMonthlyPrice', () => {
		test( 'returns default value when no parameter provided', () => {
			expect( getMonthlyPrice() ).toEqual( '-' );
		} );

		test( 'returns default value when only default value provided', () => {
			expect( getMonthlyPrice( null, null, '/' ) ).toEqual( '/' );
		} );

		test( 'returns valid monthly price when cost is integer', () => {
			expect( getMonthlyPrice( 120, 'EUR' ) ).toEqual( '€10' );
		} );

		test( 'returns valid monthly price when cost is float', () => {
			expect( getMonthlyPrice( 99.99, 'USD' ) ).toEqual( '$8.40' );
		} );
	} );

	describe( '#getEligibleGSuiteDomain', () => {
		test( 'Returns empty string if selected domain and domains are empty', () => {
			expect( getEligibleGSuiteDomain( '', [] ) ).toEqual( '' );
		} );

		test( 'Returns empty string if selected domain is invalid and domains are empty', () => {
			expect( getEligibleGSuiteDomain( 'invalid-domain.wpcomstaging.com', [] ) ).toEqual( '' );
		} );

		test( 'Returns selected domain if selected domain is valid and domains are empty', () => {
			expect( getEligibleGSuiteDomain( 'valid-domain.blog', [] ) ).toEqual( 'valid-domain.blog' );
		} );

		const domains = [
			{
				name: 'invalid-domain.wpcomstaging.com',
				type: 'REGISTERED',
			},
			{
				name: 'account-with-another-provider.blog',
				type: 'REGISTERED',
				googleAppsSubscription: { status: 'other_provider' },
			},
			{
				name: 'mapped-domain-without-wpcom-nameservers.blog',
				type: 'MAPPED',
				hasWpcomNameservers: false,
			},
			{
				name: 'mapped-domain-with-wpcom-nameservers.blog',
				type: 'MAPPED',
				hasWpcomNameservers: true,
			},
			{
				name: 'secondary-domain.blog',
				type: 'REGISTERED',
				isPrimary: false,
			},
			{
				name: 'primary-domain.blog',
				type: 'REGISTERED',
				isPrimary: true,
			},
		];

		test( 'Returns selected domain if selected domain is valid', () => {
			expect( getEligibleGSuiteDomain( 'selected-valid-domain.blog', domains ) ).toEqual(
				'selected-valid-domain.blog'
			);
		} );

		test( 'Returns primary domain if no selected domain and the primary domain is eligible', () => {
			const domainsWithEligiblePrimaryDomain = domains.map( ( domain ) =>
				domain.isPrimary ? { ...domain, hasWpcomNameservers: true } : domain
			);
			expect( getEligibleGSuiteDomain( '', domainsWithEligiblePrimaryDomain ) ).toEqual(
				'primary-domain.blog'
			);
		} );

		test( 'Returns the first eligible domain if no selected domain and the primary domain is not eligible', () => {
			expect( getEligibleGSuiteDomain( '', domains ) ).toEqual(
				'mapped-domain-with-wpcom-nameservers.blog'
			);
		} );

		test( 'Returns first non-primary domain if no selected domain and no primary domain in domains', () => {
			const domainsWithoutPrimaryDomain = domains.slice( 0, -1 );

			expect( getEligibleGSuiteDomain( '', domainsWithoutPrimaryDomain ) ).toEqual(
				'mapped-domain-with-wpcom-nameservers.blog'
			);
		} );

		test( 'Returns empty string if no selected domain and no valid domain in domains', () => {
			const domainsWithoutValidDomain = domains.slice( 0, -3 );

			expect( getEligibleGSuiteDomain( '', domainsWithoutValidDomain ) ).toEqual( '' );
		} );
	} );

	describe( '#getGSuiteSupportedDomains', () => {
		test( 'returns empty array if give empty array', () => {
			expect( getGSuiteSupportedDomains( [] ) ).toEqual( [] );
		} );

		test( 'returns empty array if domain is invalid', () => {
			expect(
				getGSuiteSupportedDomains( [
					{ name: 'foo.wpcomstaging.com', type: 'REGISTERED', googleAppsSubscription: {} },
				] )
			).toEqual( [] );
		} );

		test( 'returns domain object if domain is valid, type of registered, and wpcom nameservers', () => {
			const registered = {
				name: 'foo.blog',
				type: 'REGISTERED',
				hasWpcomNameservers: true,
				googleAppsSubscription: {},
			};

			expect( getGSuiteSupportedDomains( [ registered ] ) ).toEqual( [ registered ] );
		} );

		test( 'returns empty array if domain is valid and type of mapped without our nameservers', () => {
			const mapped = { name: 'foo.blog', type: 'MAPPED', googleAppsSubscription: {} };

			expect( getGSuiteSupportedDomains( [ mapped ] ) ).toEqual( [] );
		} );

		test( 'returns domain object if domain is valid and type of mapped with our nameservers', () => {
			const mapped = {
				name: 'foo.blog',
				type: 'MAPPED',
				googleAppsSubscription: {},
				hasWpcomNameservers: true,
			};

			expect( getGSuiteSupportedDomains( [ mapped ] ) ).toEqual( [ mapped ] );
		} );

		test( 'returns empty array if domain is valid and type of site redirected', () => {
			const siteRedirect = { name: 'foo.blog', type: 'SITE_REDIRECT', googleAppsSubscription: {} };

			expect( getGSuiteSupportedDomains( [ siteRedirect ] ) ).toEqual( [] );
		} );
	} );

	describe( '#hasGSuiteWithUs', () => {
		test( 'returns true if googleAppsSubscription has a value for status', () => {
			expect( hasGSuiteWithUs( { googleAppsSubscription: { status: 'blah' } } ) ).toEqual( true );
		} );

		test( 'returns true if googleAppsSubscription has no_subscription for status', () => {
			expect(
				hasGSuiteWithUs( { googleAppsSubscription: { status: 'no_subscription' } } )
			).toEqual( false );
		} );
	} );

	describe( '#hasGSuiteSupportedDomain', () => {
		test( 'returns false if passed an empty array', () => {
			expect( hasGSuiteSupportedDomain( [] ) ).toEqual( false );
		} );

		test( 'returns false if passed an array with invalid domains', () => {
			expect(
				hasGSuiteSupportedDomain( [
					{ name: 'foo.wpcomstaging.com', type: 'REGISTERED', googleAppsSubscription: {} },
				] )
			).toEqual( false );
		} );

		test( 'returns false if passed an array with valid domains and no nameservers', () => {
			expect(
				hasGSuiteSupportedDomain( [
					{ name: 'foo.blog', type: 'MAPPED', googleAppsSubscription: {} },
				] )
			).toEqual( false );
		} );

		test( 'returns true if passed an array with valid domains and our nameservers', () => {
			expect(
				hasGSuiteSupportedDomain( [
					{
						name: 'foo.blog',
						type: 'MAPPED',
						googleAppsSubscription: {},
						hasWpcomNameservers: true,
					},
				] )
			).toEqual( true );
		} );
	} );

	describe( '#hasPendingGSuiteUsers', () => {
		test( 'returns false if googleAppsSubscription.pendingUsers has an empty array', () => {
			expect( hasPendingGSuiteUsers( { googleAppsSubscription: { pendingUsers: [] } } ) ).toEqual(
				false
			);
		} );

		test( 'returns true if googleAppsSubscription.pendingUsers has an non-empty array', () => {
			expect(
				hasPendingGSuiteUsers( { googleAppsSubscription: { pendingUsers: [ 'foo' ] } } )
			).toEqual( true );
		} );
	} );

	describe( '#canUserPurchaseGSuite', () => {
		test( 'returns true if the user is allowed to purchase G Suite', () => {
			expect( canUserPurchaseGSuite() ).toEqual( true );
		} );
	} );
} );
