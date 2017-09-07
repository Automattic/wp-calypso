/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	DOMAINS_SUGGESTIONS_RECEIVE,
	DOMAINS_SUGGESTIONS_REQUEST,
	DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
	DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { withSchemaValidation } from 'state/utils';
import reducer, {
	items as unwrappedItems,
	requesting,
	errors
} from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

const items = withSchemaValidation( unwrappedItems.schema, unwrappedItems );

describe( 'reducer', () => {
	let sandbox;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'requesting',
			'errors'
		] );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index suggestions by serialized query', () => {
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const suggestions = [
				{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
				{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
			];
			const state = items( undefined, {
				type: DOMAINS_SUGGESTIONS_RECEIVE,
				queryObject,
				suggestions
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				]
			} );
		} );

		it( 'should accumulate domain suggestions', () => {
			const original = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				]
			} );
			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const suggestions = [
				{ domain_name: 'foobar.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
				{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
			];
			const state = items( original, {
				type: DOMAINS_SUGGESTIONS_RECEIVE,
				queryObject,
				suggestions
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				],
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'foobar.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				]
			} );
		} );

		it( 'should override previous domains suggestions', () => {
			const original = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				],
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'foobar.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				]
			} );
			const suggestions = [
				{ domain_name: 'foobarbaz.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
				{ domain_name: 'foobarbaz.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
			];

			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};

			const state = items( original, {
				type: DOMAINS_SUGGESTIONS_RECEIVE,
				queryObject,
				suggestions
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				],
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{ domain_name: 'foobarbaz.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
					{ domain_name: 'foobarbaz.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
				]
			} );
		} );

		describe( 'persistence', () => {
			it( 'persists state', () => {
				const original = deepFreeze( {
					'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
						{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
						{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
					]
				} );
				const state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
						{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
						{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
					]
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
						{ cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
						{ cost: '$18.00', product_id: 6, product_slug: 'domain_reg' }
					]
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index requesting state by serialized query', () => {
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const state = requesting( undefined, {
				type: DOMAINS_SUGGESTIONS_REQUEST,
				queryObject
			} );
			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true
			} );
		} );

		it( 'should update requesting state on success', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const state = requesting( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
				queryObject
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': false
			} );
		} );

		it( 'should update requesting state on failure', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const state = requesting( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': false
			} );
		} );

		it( 'should accumulate requesting state by query', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true
			} );
			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const state = requesting( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST,
				queryObject
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true
			} );
		} );
	} );

	describe( '#errors()', () => {
		it( 'should default to an empty object', () => {
			const state = errors( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should update errors on failure', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const error = new Error( 'something bad happened' );
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject,
				error
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error
			} );
		} );

		it( 'should update errors on success', () => {
			const error = new Error( 'something bad happened' );
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
				queryObject
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': null
			} );
		} );

		it( 'should update errors on request', () => {
			const error = new Error( 'something bad happened' );
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST,
				queryObject
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': null
			} );
		} );

		it( 'should update errors on failure', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const error = new Error( 'something bad happened' );
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject,
				error
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error
			} );
		} );

		it( 'should accumulate errors by queries', () => {
			const error = new Error( 'something bad happened' );
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error
			} );
			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false
			};
			const error2 = new Error( 'something else bad happened' );
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject,
				error: error2
			} );

			expect( state ).to.eql( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error,
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': error2
			} );
		} );
	} );
} );
