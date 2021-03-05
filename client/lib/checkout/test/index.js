/**
 * Internal dependencies
 */
import { getValidDeepRedirectTo, parseRedirectToChain } from 'calypso/lib/checkout';

describe( 'parseRedirectToChain', () => {
	test( 'should return undefined if given empty string', () => {
		const parsedChain = parseRedirectToChain( '' );
		expect( parsedChain ).toEqual( [] );
	} );

	test( 'should return array with one item when given a url with no redirect_to', () => {
		const testUrl = '/plans/my-fake-site.wordpress.com';
		const parsedChain = parseRedirectToChain( testUrl );
		expect( parsedChain ).toEqual( [ '/plans/my-fake-site.wordpress.com' ] );
	} );

	test( 'should return array with two items when given a url with a redirect_to', () => {
		const testUrl = '/plans/my-fake-site.wordpress.com?redirect_to=my-redirect.wordpress.com';
		const parsedChain = parseRedirectToChain( testUrl );
		expect( parsedChain ).toHaveLength( 2 );
		expect( parsedChain[ 1 ] ).toEqual( 'my-redirect.wordpress.com' );
	} );

	test( 'should return array with two items when given a url with a URI encoded redirect_to', () => {
		const testUrl =
			'%2Fcheckout%2Fthank-you%2Fplans%3Fintent%3Dinstall_plugin%26redirect_to%3D%252Fplugins%252Fwordpress-seo%252Fmysite.wordpress.com%26site_launched_before_upgrade%3Dtrue';
		const expectedResult = [
			'/checkout/thank-you/plans?intent=install_plugin&redirect_to=%2Fplugins%2Fwordpress-seo%2Fmysite.wordpress.com&site_launched_before_upgrade=true',
			'/plugins/wordpress-seo/mysite.wordpress.com',
		];
		const parsedChain = parseRedirectToChain( testUrl );
		expect( parsedChain ).toHaveLength( 2 );
		expect( parsedChain ).toEqual( expectedResult );
	} );
} );

describe( 'getValidDeepRedirectTo', () => {
	test( 'should return undefined when given an undefined value', () => {
		const redirectTo = undefined;
		expect( getValidDeepRedirectTo( redirectTo ) ).toEqual( undefined );
	} );

	test( 'should return undefined when given a redirectTo that points to an external site', () => {
		const redirectTo =
			'/plans/my-fake-site.wordpress.com?redirect_to=http://my-redirect.wordpress.com';
		expect( getValidDeepRedirectTo( redirectTo ) ).toEqual( undefined );
	} );

	test( 'should return undefined when given a redirectTo that points to a URI encoded external site', () => {
		const redirectTo =
			'/plans/my-fake-site.wordpress.com?redirect_to=http%3A%2F%2Fmy-redirect.wordpress.com';
		expect( getValidDeepRedirectTo( redirectTo ) ).toEqual( undefined );
	} );

	test( 'should return a relative url when given a simple redirectTo', () => {
		const redirectTo = '/plans/my-fake-site.wordpress.com';
		expect( getValidDeepRedirectTo( redirectTo ) ).toEqual( '/plans/my-fake-site.wordpress.com' );
	} );

	test( 'should return a relative url when given a nested redirectTo that points to a relative url', () => {
		const redirectTo =
			'/plans/my-fake-site.wordpress.com?redirect_to=/plugins/wordpress-seo/mysite.wordpress.com';
		expect( getValidDeepRedirectTo( redirectTo ) ).toEqual(
			'/plugins/wordpress-seo/mysite.wordpress.com'
		);
	} );

	test( 'should return a relative url when given a nested redirectTo that points to a URI encoded relative url', () => {
		const redirectTo =
			'/plans/my-fake-site.wordpress.com?redirect_to=%2Fplugins%2Fwordpress-seo%2Fmysite.wordpress.com';
		expect( getValidDeepRedirectTo( redirectTo ) ).toEqual(
			'/plugins/wordpress-seo/mysite.wordpress.com'
		);
	} );
} );
