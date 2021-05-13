/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSerializedDomainsSuggestionsQuery } from '../utils';

describe( 'utils', () => {
	describe( '#getSerializedDomainsSuggestionsQuery()', () => {
		test( 'should return a serialized query', () => {
			const query = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: true,
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":true}'
			);
		} );
		test( 'also supports include_wordpressdotcom vs includeSubdomain', () => {
			const query = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: true,
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":true}'
			);
		} );
		test( 'should lowercase a query', () => {
			const query = {
				query: 'eXaMpLe',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false,
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}'
			);
		} );
		test( 'defaults to false, when includeSubdomain is missing', () => {
			const query = {
				query: 'eXaMpLe',
				quantity: 2,
				vendor: 'domainsbot',
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}'
			);
		} );
		test( 'returns null if query is missing', () => {
			const query = {
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false,
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql( null );
		} );
		test( 'returns null if quantity is missing', () => {
			const query = {
				query: 'example',
				vendor: 'domainsbot',
				includeSubdomain: false,
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql( null );
		} );
		test( 'returns null if vendor is missing', () => {
			const query = {
				query: 'example',
				quantity: 2,
				includeSubdomain: false,
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql( null );
		} );
	} );
} );
