/**
 * Internal dependencies
 */
import {
	canDomainAddGSuite,
	getEligibleGSuiteDomain,
	getGSuiteSupportedDomains,
	hasGSuite,
	hasGSuiteSupportedDomain,
	hasPendingGSuiteUsers,
	isGSuiteRestricted,
} from 'lib/domains/gsuite';

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
		test( 'Returns selected domain name if valid', () => {
			expect( getEligibleGSuiteDomain( 'foobar.blog', [] ) ).toEqual( 'foobar.blog' );
		} );

		test( 'Returns empty string if no selected site and empty domains array', () => {
			expect( getEligibleGSuiteDomain( '', [] ) ).toEqual( '' );
		} );

		test( 'Returns empty string if selected site is invalid and empty domains array', () => {
			expect( getEligibleGSuiteDomain( 'foogoogle.blog', [] ) ).toEqual( '' );
		} );

		test( 'Returns empty string if no selected site and domains array does not contain a valid domain', () => {
			expect( getEligibleGSuiteDomain( '', [ 'foogoogle.blog' ] ) ).toEqual( '' );
		} );
	} );

	describe( '#getGSuiteSupportedDomains', () => {
		test( 'returns empty array if give empty array', () => {
			expect( getGSuiteSupportedDomains( [] ) ).toEqual( [] );
		} );

		test( 'returns empty array if domain is invalid', () => {
			expect(
				getGSuiteSupportedDomains( [ { name: 'foogoogle.blog', type: 'REGISTERED' } ] )
			).toEqual( [] );
		} );

		test( 'returns domain object if domain is valid, type of registered, and wpcom nameservers', () => {
			const registered = { name: 'foo.blog', type: 'REGISTERED', hasWpcomNameservers: true };
			expect( getGSuiteSupportedDomains( [ registered ] ) ).toEqual( [ registered ] );
		} );

		test( 'returns domain object if domain is valid and type of mapped', () => {
			const mapped = { name: 'foo.blog', type: 'MAPPED' };
			expect( getGSuiteSupportedDomains( [ mapped ] ) ).toEqual( [ mapped ] );
		} );

		test( 'returns domain object if domain is valid and type of site redirected', () => {
			const siteRedirect = { name: 'foo.blog', type: 'SITE_REDIRECT' };
			expect( getGSuiteSupportedDomains( [ siteRedirect ] ) ).toEqual( [] );
		} );
	} );

	describe( '#hasGSuite', () => {
		test( 'returns true if googleAppsSubscription has a value for status', () => {
			expect( hasGSuite( { googleAppsSubscription: { status: 'blah' } } ) ).toEqual( true );
		} );

		test( 'returns true if googleAppsSubscription has no_subscription for status', () => {
			expect( hasGSuite( { googleAppsSubscription: { status: 'no_subscription' } } ) ).toEqual(
				false
			);
		} );
	} );

	describe( '#hasGSuiteSupportedDomain', () => {
		test( 'returns false if passed an empty array', () => {
			expect( hasGSuiteSupportedDomain( [] ) ).toEqual( false );
		} );

		test( 'returns false if passed an array with invalid domains', () => {
			expect(
				hasGSuiteSupportedDomain( [ { name: 'foogoogle.blog', type: 'REGISTERED' } ] )
			).toEqual( false );
		} );

		test( 'returns true if passed an array with valid domains', () => {
			expect( hasGSuiteSupportedDomain( [ { name: 'foo.blog', type: 'MAPPED' } ] ) ).toEqual(
				true
			);
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
