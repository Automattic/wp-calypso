/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	CURRENT_USER_ID_SET,
	DESERIALIZE,
	PLANS_RECEIVE,
	SERIALIZE,
	SITE_RECEIVE,
	SITE_PLANS_FETCH_COMPLETED,
	SITES_RECEIVE
} from 'state/action-types';
import reducer, { id, capabilities, currencyCode } from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'id',
			'currencyCode',
			'capabilities',
			'flags'
		] );
	} );

	describe( '#id()', () => {
		it( 'should default to null', () => {
			const state = id( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the current user ID', () => {
			const state = id( null, {
				type: CURRENT_USER_ID_SET,
				userId: 73705554
			} );

			expect( state ).to.equal( 73705554 );
		} );

		it( 'should validate ID is positive', () => {
			const state = id( -1, {
				type: DESERIALIZE
			} );

			expect( state ).to.equal( null );
		} );

		it( 'should validate ID is a number', () => {
			const state = id( 'foobar', {
				type: DESERIALIZE
			} );

			expect( state ).to.equal( null );
		} );

		it( 'returns valid ID', () => {
			const state = id( 73705554, {
				type: DESERIALIZE
			} );

			expect( state ).to.equal( 73705554 );
		} );

		it( 'will SERIALIZE current user', () => {
			const state = id( 73705554, {
				type: SERIALIZE
			} );

			expect( state ).to.equal( 73705554 );
		} );
	} );

	describe( '#currencyCode()', () => {
		it( 'should default to null', () => {
			const state = currencyCode( undefined, {} );
			expect( state ).to.equal( null );
		} );
		it( 'should set currency code when plans are received', () => {
			const state = currencyCode( undefined, {
				type: PLANS_RECEIVE,
				plans: [
					{
						product_id: 1001,
						currency_code: 'USD'
					}
				]
			} );
			expect( state ).to.equal( 'USD' );
		} );
		it( 'should return current state when we have empty plans', () => {
			const state = currencyCode( 'USD', {
				type: PLANS_RECEIVE,
				plans: []
			} );
			expect( state ).to.equal( 'USD' );
		} );
		it( 'should update current state when we receive new plans', () => {
			const state = currencyCode( 'USD', {
				type: PLANS_RECEIVE,
				plans: [
					{
						product_id: 1001,
						currency_code: 'EUR'
					}
				]
			} );
			expect( state ).to.equal( 'EUR' );
		} );
		it( 'should return current state when we have empty site plans', () => {
			const state = currencyCode( 'USD', {
				type: SITE_PLANS_FETCH_COMPLETED,
				plans: []
			} );
			expect( state ).to.equal( 'USD' );
		} );
		it( 'should set currency code when site plans are received', () => {
			const state = currencyCode( undefined, {
				type: SITE_PLANS_FETCH_COMPLETED,
				plans: [
					{
						productName: 'Free',
						currencyCode: 'USD'
					}
				]
			} );
			expect( state ).to.equal( 'USD' );
		} );
		it( 'should update currency code when site plans are received', () => {
			const state = currencyCode( 'USD', {
				type: SITE_PLANS_FETCH_COMPLETED,
				plans: [
					{
						productName: 'Free',
						currencyCode: 'CAD'
					}
				]
			} );
			expect( state ).to.equal( 'CAD' );
		} );
		it( 'should persist state', () => {
			const original = 'JPY';
			const state = currencyCode( original, {
				type: SERIALIZE
			} );
			expect( state ).to.equal( original );
		} );
		it( 'should restore valid persisted state', () => {
			const original = 'JPY';
			const state = currencyCode( original, {
				type: DESERIALIZE
			} );
			expect( state ).to.equal( original );
		} );
		it( 'should ignore invalid persisted state', () => {
			const original = 1234;
			const state = currencyCode( original, {
				type: DESERIALIZE
			} );
			expect( state ).to.equal( null );
		} );
	} );

	describe( 'capabilities()', () => {
		it( 'should default to an empty object', () => {
			const state = capabilities( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should track capabilities by single received site', () => {
			const state = capabilities( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
					capabilities: {
						manage_options: false
					}
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					manage_options: false
				}
			} );
		} );

		it( 'should accumulate capabilities by received site', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false
				}
			} );
			const state = capabilities( original, {
				type: SITE_RECEIVE,
				site: {
					ID: 77203074,
					capabilities: {
						manage_options: true
					}
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					manage_options: false
				},
				77203074: {
					manage_options: true
				}
			} );
		} );

		it( 'should ignore received site if missing capabilities', () => {
			const state = capabilities( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284
				}
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track capabilities by multiple received sites', () => {
			const state = capabilities( undefined, {
				type: SITES_RECEIVE,
				sites: [ {
					ID: 2916284,
					capabilities: {
						manage_options: false
					}
				} ]
			} );

			expect( state ).to.eql( {
				2916284: {
					manage_options: false
				}
			} );
		} );

		it( 'should ignore received sites if missing capabilities', () => {
			const state = capabilities( undefined, {
				type: SITES_RECEIVE,
				sites: [ {
					ID: 2916284
				} ]
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false
				}
			} );
			const state = capabilities( original, {
				type: SERIALIZE
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should restore valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false
				}
			} );
			const state = capabilities( original, {
				type: DESERIALIZE
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should not restore invalid persisted state', () => {
			const original = deepFreeze( {
				BAD2916284: {
					manage_options: false
				}
			} );
			const state = capabilities( original, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
