/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSerializedDomainsSuggestionsQuery
} from '../utils';

describe( 'utils', () => {
	describe( '#getSerializedDomainsSuggestionsQuery()', () => {
		it( 'should return a serialized query', () => {
			const query = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: true
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":true}'
			);
		} );
		it( 'also supports include_wordpressdotcom vs includeSubdomain', () => {
			const query = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: true
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":true}'
			);
		} );
		it( 'should lowercase a query', () => {
			const query = {
				query: 'eXaMpLe',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}'
			);
		} );
		it( 'defaults to false, when includeSubdomain is missing', () => {
			const query = {
				query: 'eXaMpLe',
				quantity: 2,
				vendor: 'domainsbot'
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}'
			);
		} );
		it( 'returns null if query is missing', () => {
			const query = {
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				null
			);
		} );
		it( 'returns null if quantity is missing', () => {
			const query = {
				query: 'example',
				vendor: 'domainsbot',
				includeSubdomain: false
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				null
			);
		} );
		it( 'returns null if vendor is missing', () => {
			const query = {
				query: 'example',
				quantity: 2,
				includeSubdomain: false
			};
			expect( getSerializedDomainsSuggestionsQuery( query ) ).to.eql(
				null
			);
		} );
	} );
} );
