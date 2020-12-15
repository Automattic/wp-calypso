/**
 * Internal dependencies
 */
import {
	getEligibleEmailForwardingDomain,
	getEmailForwardingSupportedDomains,
} from 'calypso/lib/domains/email-forwarding';

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
	describe( '#getEligibleEmailForwardingDomain', () => {
		test( 'Returns an emtpy string if selected domain name is not in domains array', () => {
			expect( getEligibleEmailForwardingDomain( 'foobar.blog', [] ) ).toEqual( '' );
		} );

		test( 'Returns selected domain name if that domain is valid for email forwarding', () => {
			expect(
				getEligibleEmailForwardingDomain( 'foobar.blog', [
					{
						name: 'foobar2.blog',
						type: 'REGISTERED',
						hasWpcomNameservers: true,
						googleAppsSubscription: { status: 'no_subscription' },
					},
					{
						name: 'foobar.blog',
						type: 'REGISTERED',
						hasWpcomNameservers: true,
						googleAppsSubscription: { status: 'no_subscription' },
					},
				] )
			).toEqual( 'foobar.blog' );
		} );

		test( 'Returns an empty string if selectedt domain name is invalid for email forwarding', () => {
			expect(
				getEligibleEmailForwardingDomain( 'foobar.blog', [
					{
						name: 'foobar.blog',
						type: 'REGISTERED',
						hasWpcomNameservers: false,
						googleAppsSubscription: { status: 'no_subscription' },
					},
				] )
			).toEqual( '' );
		} );

		test( 'Returns empty string if no selected site and domains array does not contain a valid domain', () => {
			expect( getEligibleEmailForwardingDomain( '', [ 'foobar.blog' ] ) ).toEqual( '' );
		} );

		test( 'Returns first site domain name if it is valid for email forwarding', () => {
			expect(
				getEligibleEmailForwardingDomain( '', [
					{
						name: 'foobar.blog',
						type: 'REGISTERED',
						hasWpcomNameservers: true,
						googleAppsSubscription: { status: 'no_subscription' },
					},
				] )
			).toEqual( 'foobar.blog' );
		} );
	} );

	describe( '#getEmailForwardingSupportedDomains', () => {
		test( 'returns empty array if give empty array', () => {
			expect( getEmailForwardingSupportedDomains( [] ) ).toEqual( [] );
		} );

		test( 'returns empty array if domain has pointed DNS', () => {
			expect(
				getEmailForwardingSupportedDomains( [
					{
						name: 'foobar.blog',
						type: 'REGISTERED',
						hasWpcomNameservers: false,
						googleAppsSubscription: { status: 'no_subscription' },
					},
				] )
			).toEqual( [] );
		} );

		test( 'returns empty array if domain has G Suite', () => {
			expect(
				getEmailForwardingSupportedDomains( [
					{
						name: 'foobar.blog',
						type: 'REGISTERED',
						hasWpcomNameservers: false,
						googleAppsSubscription: { status: 'something' },
					},
				] )
			).toEqual( [] );
		} );

		test( 'returns empty array if domain has unsupported type', () => {
			expect(
				getEmailForwardingSupportedDomains( [
					{
						name: 'foobar.blog',
						type: 'TRANSFER',
						hasWpcomNameservers: false,
						googleAppsSubscription: { status: 'something' },
					},
				] )
			).toEqual( [] );
		} );

		test( 'returns domain object if domain is valid, type of registered, and wpcom nameservers', () => {
			const registered = {
				name: 'foo.blog',
				type: 'REGISTERED',
				hasWpcomNameservers: true,
				googleAppsSubscription: { status: 'no_subscription' },
			};
			expect( getEmailForwardingSupportedDomains( [ registered ] ) ).toEqual( [ registered ] );
		} );

		test( 'returns domain object if domain is valid and type of mapped', () => {
			const mapped = {
				name: 'foo.blog',
				type: 'MAPPED',
				googleAppsSubscription: { status: 'no_subscription' },
			};
			expect( getEmailForwardingSupportedDomains( [ mapped ] ) ).toEqual( [ mapped ] );
		} );

		test( 'returns domain object if domain is valid and type of site redirected', () => {
			const siteRedirect = {
				name: 'foo.blog',
				type: 'SITE_REDIRECT',
				googleAppsSubscription: { status: 'no_subscription' },
			};
			expect( getEmailForwardingSupportedDomains( [ siteRedirect ] ) ).toEqual( [] );
		} );
	} );
} );
