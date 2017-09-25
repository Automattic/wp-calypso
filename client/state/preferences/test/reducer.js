/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { localValues, remoteValues, fetching } from '../reducer';
import { PREFERENCES_SET, PREFERENCES_RECEIVE, PREFERENCES_FETCH, PREFERENCES_FETCH_SUCCESS, PREFERENCES_FETCH_FAILURE, PREFERENCES_SAVE_SUCCESS, SERIALIZE, DESERIALIZE } from 'state/action-types';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'localValues',
			'remoteValues',
			'fetching',
			'lastFetchedTimestamp'
		] );
	} );

	describe( 'localValues()', () => {
		it( 'should default to an empty object', () => {
			const state = localValues( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track preference values set by key', () => {
			const state = localValues( undefined, {
				type: PREFERENCES_SET,
				key: 'foo',
				value: 'bar'
			} );

			expect( state ).to.eql( {
				foo: 'bar'
			} );
		} );

		it( 'should accumulate preference values by key', () => {
			const original = deepFreeze( {
				foo: 'bar'
			} );
			const state = localValues( original, {
				type: PREFERENCES_SET,
				key: 'baz',
				value: 'qux'
			} );

			expect( state ).to.eql( {
				foo: 'bar',
				baz: 'qux'
			} );
		} );

		it( 'should return same state reference if no change in value', () => {
			const original = deepFreeze( {
				foo: 'bar'
			} );
			const state = localValues( original, {
				type: PREFERENCES_SET,
				key: 'foo',
				value: 'bar'
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should remove a preference key on a successful preference save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux'
			} );
			const state = localValues( original, {
				type: PREFERENCES_SAVE_SUCCESS,
				key: 'foo',
				value: 'bar'
			} );

			expect( state ).to.eql( {
				baz: 'qux'
			} );
		} );
	} );

	describe( 'remoteValues()', () => {
		it( 'should default to null', () => {
			const state = remoteValues( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set its state to received preferences values', () => {
			const state = remoteValues( undefined, {
				type: PREFERENCES_RECEIVE,
				values: {
					foo: 'bar'
				}
			} );

			expect( state ).to.eql( {
				foo: 'bar'
			} );
		} );

		it( 'should replace its state with the next received values', () => {
			const original = deepFreeze( {
				foo: 'bar'
			} );
			const state = remoteValues( original, {
				type: PREFERENCES_RECEIVE,
				values: {
					baz: 'qux'
				}
			} );

			expect( state ).to.eql( {
				baz: 'qux'
			} );
		} );
	} );

	describe( 'fetching()', () => {
		it( 'should default to false', () => {
			const state = fetching( undefined, {} );
			expect( state ).to.eql( false );
		} );
		it( 'should update fetching state on fetch', () => {
			const state = fetching( undefined, {
				type: PREFERENCES_FETCH
			} );
			expect( state ).to.eql( true );
		} );
		it( 'should update fetching state on success', () => {
			const state = fetching( true, {
				type: PREFERENCES_FETCH_SUCCESS
			} );
			expect( state ).to.eql( false );
		} );
		it( 'should update fetching state on failure', () => {
			const original = { all: true };
			const state = fetching( original, {
				type: PREFERENCES_FETCH_FAILURE
			} );
			expect( state ).to.eql( false );
		} );
		it( 'should never persist state', () => {
			const state = fetching( true, {
				type: SERIALIZE
			} );
			expect( state ).to.eql( false );
		} );
		it( 'should never load persisted state', () => {
			const state = fetching( true, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( false );
		} );
	} );
} );
