import deepFreeze from 'deep-freeze';
import {
	DOMAINS_SUGGESTIONS_RECEIVE,
	DOMAINS_SUGGESTIONS_REQUEST,
	DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
	DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import reducer, { items, requesting, errors } from '../reducer';

describe( 'reducer', () => {
	console.warn = jest.fn();

	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'requesting', 'errors' ] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should index suggestions by serialized query', () => {
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const suggestions = [
				{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
				{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
			];
			const state = items( undefined, {
				type: DOMAINS_SUGGESTIONS_RECEIVE,
				queryObject,
				suggestions,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'example.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
				],
			} );
		} );

		test( 'should accumulate domain suggestions', () => {
			const original = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'example.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
				],
			} );
			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const suggestions = [
				{ domain_name: 'foobar.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
				{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
			];
			const state = items( original, {
				type: DOMAINS_SUGGESTIONS_RECEIVE,
				queryObject,
				suggestions,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'example.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
				],
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'foobar.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
				],
			} );
		} );

		test( 'should override previous domains suggestions', () => {
			const original = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'example.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
				],
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'foobar.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{ domain_name: 'foobar.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
				],
			} );
			const suggestions = [
				{
					domain_name: 'foobarbaz.me',
					cost: '$25.00',
					product_id: 46,
					product_slug: 'dotme_domain',
				},
				{ domain_name: 'foobarbaz.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
			];

			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};

			const state = items( original, {
				type: DOMAINS_SUGGESTIONS_RECEIVE,
				queryObject,
				suggestions,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'example.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
				],
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': [
					{
						domain_name: 'foobarbaz.me',
						cost: '$25.00',
						product_id: 46,
						product_slug: 'dotme_domain',
					},
					{
						domain_name: 'foobarbaz.org',
						cost: '$18.00',
						product_id: 6,
						product_slug: 'domain_reg',
					},
				],
			} );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( {
					'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
						[
							{
								domain_name: 'example.me',
								cost: '$25.00',
								product_id: 46,
								product_slug: 'dotme_domain',
							},
							{
								domain_name: 'example.org',
								cost: '$18.00',
								product_id: 6,
								product_slug: 'domain_reg',
							},
						],
				} );
				const state = serialize( items, original );
				expect( state ).toEqual( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
						[
							{
								domain_name: 'example.me',
								cost: '$25.00',
								product_id: 46,
								product_slug: 'dotme_domain',
							},
							{
								domain_name: 'example.org',
								cost: '$18.00',
								product_id: 6,
								product_slug: 'domain_reg',
							},
						],
				} );
				const state = deserialize( items, original );
				expect( state ).toEqual( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
						[
							{ cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
							{ cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
						],
				} );
				const state = deserialize( items, original );
				expect( state ).toEqual( {} );
			} );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should index requesting state by serialized query', () => {
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const state = requesting( undefined, {
				type: DOMAINS_SUGGESTIONS_REQUEST,
				queryObject,
			} );
			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
			} );
		} );

		test( 'should update requesting state on success', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const state = requesting( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
				queryObject,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': false,
			} );
		} );

		test( 'should update requesting state on failure', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const state = requesting( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': false,
			} );
		} );

		test( 'should accumulate requesting state by query', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
			} );
			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const state = requesting( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST,
				queryObject,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
			} );
		} );
	} );

	describe( '#errors()', () => {
		test( 'should default to an empty object', () => {
			const state = errors( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should update errors on failure', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const error = new Error( 'something bad happened' );
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject,
				error,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					error,
			} );
		} );

		test( 'should update errors on success', () => {
			const error = new Error( 'something bad happened' );
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					error,
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
				queryObject,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					null,
			} );
		} );

		test( 'should update errors on request', () => {
			const error = new Error( 'something bad happened' );
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					error,
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST,
				queryObject,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					null,
			} );
		} );

		test( 'should update errors on error', () => {
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}': true,
			} );
			const queryObject = {
				query: 'example',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const error = new Error( 'something bad happened' );
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject,
				error,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					error,
			} );
		} );

		test( 'should accumulate errors by queries', () => {
			const error = new Error( 'something bad happened' );
			const originalState = deepFreeze( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					error,
			} );
			const queryObject = {
				query: 'foobar',
				quantity: 2,
				vendor: 'domainsbot',
				include_wordpressdotcom: false,
			};
			const error2 = new Error( 'something else bad happened' );
			const state = errors( originalState, {
				type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
				queryObject,
				error: error2,
			} );

			expect( state ).toEqual( {
				'{"query":"example","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					error,
				'{"query":"foobar","quantity":2,"vendor":"domainsbot","include_wordpressdotcom":false}':
					error2,
			} );
		} );
	} );
} );
