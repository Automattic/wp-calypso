/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { getFixedDomainSearch, getDomainSuggestionSearch } from 'lib/domains';

describe( 'index', () => {
	describe( '#getFixedDomainSearch', () => {
		test( 'should return an empty string when searching for generic URL prefixes', () => {
			const searches = [ 'http://', 'https://' ];

			forEach( searches, ( search ) => {
				expect( getFixedDomainSearch( search ) ).toEqual( '' );
			} );
		} );

		test( 'should strip generic URL prefixes from a valid search string', () => {
			const searches = [
				'http://example.com',
				'https://example.com',
				'www.example.com',
				'www1.example.com',
				'http://www.example.com',
				'https://www.example.com',
			];

			forEach( searches, ( search ) => {
				expect( getFixedDomainSearch( search ) ).toEqual( 'example.com' );
			} );
		} );

		test( 'should allow domain names beginning with www or http(s)', () => {
			const searches = [ 'wwwexample.com', 'httpexample.com', 'httpsexample.com' ];

			forEach( searches, ( search ) => {
				expect( getFixedDomainSearch( search ) ).toEqual( search );
			} );
		} );
	} );

	describe( '#getDomainSuggestionSearch', () => {
		test( 'should return an empty string when searching for www, http or https', () => {
			const searches = [ 'www', 'http', 'https' ];

			forEach( searches, ( search ) => {
				expect( getDomainSuggestionSearch( search ) ).toEqual( '' );
			} );
		} );

		test( 'should return an empty string when searching for a string shorter than the minimum length', () => {
			const minLength = 3;
			const search = 'zz';
			expect( getDomainSuggestionSearch( search, minLength ) ).toEqual( '' );
		} );

		test( 'should return the original search string if it is long enough and is not one of the ignored strings', () => {
			const search = 'hippos';
			expect( getDomainSuggestionSearch( search ) ).toEqual( search );
		} );
	} );
} );
