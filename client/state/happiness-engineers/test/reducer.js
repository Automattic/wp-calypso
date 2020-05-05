/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, items } from '../reducer';
import {
	HAPPINESS_ENGINEERS_FETCH,
	HAPPINESS_ENGINEERS_RECEIVE,
	HAPPINESS_ENGINEERS_FETCH_FAILURE,
	HAPPINESS_ENGINEERS_FETCH_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requesting', 'items' ] );
	} );

	describe( 'requesting()', () => {
		test( 'should default to false', () => {
			const isRequestingHappinessEngineers = requesting( undefined, {} );

			expect( isRequestingHappinessEngineers ).to.be.false;
		} );

		test( 'should return true if request is in progress', () => {
			const isRequestingHappinessEngineers = requesting( undefined, {
				type: HAPPINESS_ENGINEERS_FETCH,
			} );

			expect( isRequestingHappinessEngineers ).to.be.true;
		} );

		test( 'should return false if request was successful', () => {
			const isRequestingHappinessEngineers = requesting( undefined, {
				type: HAPPINESS_ENGINEERS_FETCH_SUCCESS,
			} );

			expect( isRequestingHappinessEngineers ).to.be.false;
		} );

		test( 'should return false if request failed', () => {
			const isRequestingHappinessEngineers = requesting( undefined, {
				type: HAPPINESS_ENGINEERS_FETCH_FAILURE,
			} );

			expect( isRequestingHappinessEngineers ).to.be.false;
		} );
	} );

	describe( 'items()', () => {
		test( 'should default to null', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( null );
		} );

		test( 'should save the received happiness engineers', () => {
			const state = items( null, {
				type: HAPPINESS_ENGINEERS_RECEIVE,
				happinessEngineers: [ { avatar_URL: 'test 1' }, { avatar_URL: 'test 2' } ],
			} );

			expect( state ).to.eql( [ 'test 1', 'test 2' ] );
		} );

		test( 'should rewrite old state with received', () => {
			const original = deepFreeze( {
				'test 1': { avatar_URL: 'test 1' },
				'test 2': { avatar_URL: 'test 2' },
			} );

			const state = items( original, {
				type: HAPPINESS_ENGINEERS_RECEIVE,
				happinessEngineers: [ { avatar_URL: 'test 3' } ],
			} );

			expect( state ).to.eql( [ 'test 3' ] );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( [ 'test 3' ] );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( [ 'test 3' ] );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( [ 'test 3' ] );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( [ 'test 3' ] );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				'test 3': { URL: 'test 3' },
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( null );
		} );
	} );
} );
