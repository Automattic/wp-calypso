/** @format */

/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { getFixedDomainSearch } from 'lib/domains';

describe( 'index', () => {
	describe( '#getFixedDomainSearch', () => {
		test( 'should return an empty string when searching for generic URL prefixes', () => {
			const searches = [ 'http://', 'https://' ];

			forEach( searches, search => {
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

			forEach( searches, search => {
				expect( getFixedDomainSearch( search ) ).toEqual( 'example.com' );
			} );
		} );

		test( 'should allow domain names beginning with www or http(s)', () => {
			const searches = [ 'wwwexample.com', 'httpexample.com', 'httpsexample.com' ];

			forEach( searches, search => {
				expect( getFixedDomainSearch( search ) ).toEqual( search );
			} );
		} );
	} );
} );
