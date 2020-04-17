/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { id, capabilities, currencyCode } from '../reducer';
import {
	CURRENT_USER_RECEIVE,
	DESERIALIZE,
	PLANS_RECEIVE,
	SERIALIZE,
	SITE_RECEIVE,
	SITE_PLANS_FETCH_COMPLETED,
	SITES_RECEIVE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'id',
			'currencyCode',
			'capabilities',
			'flags',
			'gravatarStatus',
			'emailVerification',
			'lasagnaJwt',
		] );
	} );

	describe( '#id()', () => {
		test( 'should default to null', () => {
			const state = id( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'should set the current user ID', () => {
			const state = id( null, {
				type: CURRENT_USER_RECEIVE,
				user: { ID: 73705554 },
			} );

			expect( state ).to.equal( 73705554 );
		} );

		test( 'should validate ID is positive', () => {
			const state = id( -1, {
				type: DESERIALIZE,
			} );

			expect( state ).to.equal( null );
		} );

		test( 'should validate ID is a number', () => {
			const state = id( 'foobar', {
				type: DESERIALIZE,
			} );

			expect( state ).to.equal( null );
		} );

		test( 'returns valid ID', () => {
			const state = id( 73705554, {
				type: DESERIALIZE,
			} );

			expect( state ).to.equal( 73705554 );
		} );

		test( 'will SERIALIZE current user', () => {
			const state = id( 73705554, {
				type: SERIALIZE,
			} );

			expect( state ).to.equal( 73705554 );
		} );
	} );

	describe( '#currencyCode()', () => {
		test( 'should default to null', () => {
			const state = currencyCode( undefined, {} );
			expect( state ).to.equal( null );
		} );
		test( 'should set currency code when plans are received', () => {
			const state = currencyCode( undefined, {
				type: PLANS_RECEIVE,
				plans: [
					{
						product_id: 1001,
						currency_code: 'USD',
					},
				],
			} );
			expect( state ).to.equal( 'USD' );
		} );
		test( 'should return current state when we have empty plans', () => {
			const state = currencyCode( 'USD', {
				type: PLANS_RECEIVE,
				plans: [],
			} );
			expect( state ).to.equal( 'USD' );
		} );
		test( 'should update current state when we receive new plans', () => {
			const state = currencyCode( 'USD', {
				type: PLANS_RECEIVE,
				plans: [
					{
						product_id: 1001,
						currency_code: 'EUR',
					},
				],
			} );
			expect( state ).to.equal( 'EUR' );
		} );
		test( 'should return current state when we have empty site plans', () => {
			const state = currencyCode( 'USD', {
				type: SITE_PLANS_FETCH_COMPLETED,
				plans: [],
			} );
			expect( state ).to.equal( 'USD' );
		} );
		test( 'should set currency code when site plans are received', () => {
			const state = currencyCode( undefined, {
				type: SITE_PLANS_FETCH_COMPLETED,
				plans: [
					{
						productName: 'Free',
						currencyCode: 'USD',
					},
				],
			} );
			expect( state ).to.equal( 'USD' );
		} );
		test( 'should update currency code when site plans are received', () => {
			const state = currencyCode( 'USD', {
				type: SITE_PLANS_FETCH_COMPLETED,
				plans: [
					{
						productName: 'Free',
						currencyCode: 'CAD',
					},
				],
			} );
			expect( state ).to.equal( 'CAD' );
		} );
		test( 'should persist state', () => {
			const original = 'JPY';
			const state = currencyCode( original, {
				type: SERIALIZE,
			} );
			expect( state ).to.equal( original );
		} );
		test( 'should restore valid persisted state', () => {
			const original = 'JPY';
			const state = currencyCode( original, {
				type: DESERIALIZE,
			} );
			expect( state ).to.equal( original );
		} );
		test( 'should ignore invalid persisted state', () => {
			const original = 1234;
			const state = currencyCode( original, {
				type: DESERIALIZE,
			} );
			expect( state ).to.equal( null );
		} );
	} );

	describe( 'capabilities()', () => {
		test( 'should default to an empty object', () => {
			const state = capabilities( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should track capabilities by single received site', () => {
			const state = capabilities( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
					capabilities: {
						manage_options: false,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					manage_options: false,
				},
			} );
		} );

		test( 'should accumulate capabilities by received site', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = capabilities( original, {
				type: SITE_RECEIVE,
				site: {
					ID: 77203074,
					capabilities: {
						manage_options: true,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					manage_options: false,
				},
				77203074: {
					manage_options: true,
				},
			} );
		} );

		test( 'should ignore received site if missing capabilities', () => {
			const state = capabilities( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
				},
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track capabilities by multiple received sites', () => {
			const state = capabilities( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2916284,
						capabilities: {
							manage_options: false,
						},
					},
				],
			} );

			expect( state ).to.eql( {
				2916284: {
					manage_options: false,
				},
			} );
		} );

		test( 'should ignore received sites if missing capabilities', () => {
			const state = capabilities( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2916284,
					},
				],
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should return same state if received sites result in same capabilities', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = capabilities( original, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2916284,
						capabilities: {
							manage_options: false,
						},
					},
				],
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = capabilities( original, {
				type: SERIALIZE,
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should restore valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = capabilities( original, {
				type: DESERIALIZE,
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should not restore invalid persisted state', () => {
			const original = deepFreeze( {
				BAD2916284: {
					manage_options: false,
				},
			} );
			const state = capabilities( original, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
