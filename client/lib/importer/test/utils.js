/**
 * Internal dependencies
 */
import { suggestDomainFromImportUrl } from '../utils';

describe( 'suggestDomainFromImportUrl', () => {
	it( 'should suggest the path name, for wix sites, if present', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://user.wixsite.com/mysite' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the path name, for medium sites, if present', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://medium.com/mysite' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the domain for WordPress.com sites', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://mysite.wordpress.com' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the subdomain for Blogger sites', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://mysite.blogspot.com/' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the subdomain for GoDaddy GoCentral sites', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://mysite.godaddysites.com/' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the subdomain for Squarespace sites', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://mysite.squarespace.com/' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the subdomain for Tumblr sites', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://mysite.tumblr.com' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the entire hostpath if a subdomain is present', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://blog.example.com' );

		expect( suggestedDomain ).toEqual( 'blog.example.com' );
	} );

	it( 'should suggest the primary domain and tld without a trailing slash, if present', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://example.com/' );

		expect( suggestedDomain ).toEqual( 'example.com' );
	} );

	it( 'should return null if domain cannot be parsed', () => {
		const suggestedDomain = suggestDomainFromImportUrl( '' );

		expect( suggestedDomain ).toBeNull();
	} );
} );
