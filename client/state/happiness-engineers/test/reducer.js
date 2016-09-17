/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	HAPPINESS_ENGINEERS_FETCH,
	HAPPINESS_ENGINEERS_RECEIVE,
	HAPPINESS_ENGINEERS_FETCH_FAILURE,
	HAPPINESS_ENGINEERS_FETCH_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';
import reducer, { requesting, items } from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items'
		] );
	} );

	describe( 'requesting()', () => {
		it( 'should default to false', () => {
			const isRequesting = requesting( undefined, {} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if request is in progress', () => {
			const isRequesting = requesting( undefined, {
				type: HAPPINESS_ENGINEERS_FETCH
			} );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if request was successful', () => {
			const isRequesting = requesting( undefined, {
				type: HAPPINESS_ENGINEERS_FETCH_SUCCESS
			} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if request failed', () => {
			const isRequesting = requesting( undefined, {
				type: HAPPINESS_ENGINEERS_FETCH_FAILURE
			} );

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( 'items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should save the received happiness engineers', () => {
			const state = items( null, {
				type: HAPPINESS_ENGINEERS_RECEIVE,
				happinessEngineers: [
					{ avatar_URL: 'test 1' },
					{ avatar_URL: 'test 2' }
				]
			} );

			expect( state ).to.eql( {
				'test 1': { avatar_URL: 'test 1' },
				'test 2': { avatar_URL: 'test 2' }
			} );
		} );

		it( 'should rewrite old state with received', () => {
			const original = deepFreeze( {
				'test 1': { avatar_URL: 'test 1' },
				'test 2': { avatar_URL: 'test 2' }
			} );

			const state = items( original, {
				type: HAPPINESS_ENGINEERS_RECEIVE,
				happinessEngineers: [
					{ avatar_URL: 'test 3' }
				]
			} );

			expect( state ).to.eql( {
				'test 3': { avatar_URL: 'test 3' }
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				'test 3': { avatar_URL: 'test 3' }
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				'test 3': { avatar_URL: 'test 3' }
			} );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				'test 3': { avatar_URL: 'test 3' }
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				'test 3': { avatar_URL: 'test 3' }
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				'test 3': { URL: 'test 3' }
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
