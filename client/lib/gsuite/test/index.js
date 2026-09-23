import {
	canDomainAddGSuite,
	getAnnualPrice,
	getGSuiteSupportedDomains,
	getMonthlyPrice,
	hasGSuiteSupportedDomain,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';

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

		test( 'returns false if passed an array with a single undefined member', () => {
			expect( hasGSuiteSupportedDomain( [ undefined ] ) ).toEqual( false );
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
} );
