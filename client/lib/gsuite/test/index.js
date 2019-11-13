/**
 * Internal dependencies
 */
import {
	canDomainAddGSuite,
	getEligibleGSuiteDomain,
	getGSuiteSupportedDomains,
	hasGSuiteSupportedDomain,
	hasGSuiteWithUs,
	hasPendingGSuiteUsers,
	isGSuiteRestricted,
} from 'lib/gsuite';

jest.mock( 'lib/user/', () => {
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

		test( 'returns false when domain has invalid TLD', () => {
			expect( canDomainAddGSuite( 'foobar.in' ) ).toEqual( false );
		} );

		test( 'returns false when domain has banned phrase', () => {
			expect( canDomainAddGSuite( 'foobargoogle.blog' ) ).toEqual( false );
		} );
	} );

	describe( '#getEligibleGSuiteDomain', () => {
		test( 'Returns empty string if selected domain and domains are empty', () => {
			expect( getEligibleGSuiteDomain( '', [] ) ).toEqual( '' );
		} );

		test( 'Returns empty string if selected domain is invalid and domains are empty', () => {
			expect( getEligibleGSuiteDomain( 'domain-with-google-banned-term.blog', [] ) ).toEqual( '' );
		} );

		test( 'Returns selected domain if selected domain is valid and domains are empty', () => {
			expect( getEligibleGSuiteDomain( 'valid-domain.blog', [] ) ).toEqual( 'valid-domain.blog' );
		} );

		const domains = [
			{
				name: 'domain-with-google-banned-term.blog',
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

		test( 'Returns primary domain if no selected domain', () => {
			expect( getEligibleGSuiteDomain( '', domains ) ).toEqual( 'primary-domain.blog' );
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
					{ name: 'foogoogle.blog', type: 'REGISTERED', googleAppsSubscription: {} },
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
					{ name: 'foogoogle.blog', type: 'REGISTERED', googleAppsSubscription: {} },
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

	describe( '#isGSuiteRestricted', () => {
		test( 'returns false if user is not G Suite restricted', () => {
			expect( isGSuiteRestricted() ).toEqual( false );
		} );
	} );
} );
