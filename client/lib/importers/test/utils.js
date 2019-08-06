/**
 * Internal dependencies
 */
import { suggestDomainFromImportUrl } from '../utils';

describe( 'suggestDomainFromImportUrl', () => {
	it( 'should suggest the path name, if present', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://user.wixsite.com/mysite' );
		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the subdomain, if present', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://mysite.godaddysites.com/' );

		expect( suggestedDomain ).toEqual( 'mysite' );
	} );

	it( 'should suggest the primary domain and tld, if present', () => {
		const suggestedDomain = suggestDomainFromImportUrl( 'https://example.com' );

		expect( suggestedDomain ).toEqual( 'example.com' );
	} );

	it( 'should return null if domain cannot be parsed', () => {
		const suggestedDomain = suggestDomainFromImportUrl( '' );

		expect( suggestedDomain ).toBeNull();
	} );
} );
