/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getDomainsSuggestions,
	getDomainsSuggestionsError,
	isRequestingDomainsSuggestions
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getDomainsSuggestions()', () => {
		it( 'should return domain suggestions for a given query', () => {
			const state = {
				domains: {
					suggestions: {
						items: {
							'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
								{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
								{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
							],
							'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
								{ domain_name: 'foobar.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
								{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
							]
						}
					}
				}
			};

			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false
			};

			const domainSuggestions = getDomainsSuggestions( state, queryObject );

			expect( domainSuggestions ).to.eql( [
				{ domain_name: 'foobar.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
				{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
			] );
		} );
	} );
	describe( '#isRequestingDomainsSuggestions()', () => {
		it( 'should return requesting domains suggestion state for a given query', () => {
			const state = {
				domains: {
					suggestions: {
						requesting: {
							'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
							'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': false
						}
					}
				}
			};

			const example = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false
			};

			const foobar = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false
			};

			const notDefined = {
				query: 'notDefined',
				quantity: 2,
				vendor: 'domainsbot',
				includeSubdomain: false
			};

			expect( isRequestingDomainsSuggestions( state, example ) ).to.equal( true );
			expect( isRequestingDomainsSuggestions( state, foobar ) ).to.equal( false );
			expect( isRequestingDomainsSuggestions( state, notDefined ) ).to.equal( false );
		} );
		describe( '#getDomainsSuggestionsError()', () => {
			it( 'should return requesting domains suggestion state for a given query', () => {
				const error = new Error( 'something went wrong' );
				const state = {
					domains: {
						suggestions: {
							errors: {
								'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error,
								'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': null
							}
						}
					}
				};

				const example = {
					query: 'example',
					quantity: 2,
					vendor: 'domainsbot',
					includeSubdomain: false
				};

				const foobar = {
					query: 'foobar',
					quantity: 2,
					vendor: 'domainsbot',
					includeSubdomain: false
				};

				const notDefined = {
					query: 'notDefined',
					quantity: 2,
					vendor: 'domainsbot',
					includeSubdomain: false
				};

				expect( getDomainsSuggestionsError( state, example ) ).to.equal( error );
				expect( getDomainsSuggestionsError( state, foobar ) ).to.equal( null );
				expect( getDomainsSuggestionsError( state, notDefined ) ).to.equal( null );
			} );
		} );
	} );
} );
