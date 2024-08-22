import deepFreeze from 'deep-freeze';
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE,
	PREFERENCES_SAVE_SUCCESS,
} from 'calypso/state/action-types';
import reducer, { localValues, remoteValues, fetching } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'localValues',
				'remoteValues',
				'fetching',
				'lastFetchedTimestamp',
			] )
		);
	} );

	describe( 'localValues()', () => {
		test( 'should default to an empty object', () => {
			const state = localValues( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track preference values set by key', () => {
			const state = localValues( undefined, {
				type: PREFERENCES_SET,
				key: 'foo',
				value: 'bar',
			} );

			expect( state ).toEqual( {
				foo: 'bar',
			} );
		} );

		test( 'should accumulate preference values by key', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );
			const state = localValues( original, {
				type: PREFERENCES_SET,
				key: 'baz',
				value: 'qux',
			} );

			expect( state ).toEqual( {
				foo: 'bar',
				baz: 'qux',
			} );
		} );

		test( 'should return same state reference if no change in value', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );
			const state = localValues( original, {
				type: PREFERENCES_SET,
				key: 'foo',
				value: 'bar',
			} );

			expect( state ).toEqual( original );
		} );

		test( 'should remove a preference key on a successful preference save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux',
			} );
			const state = localValues( original, {
				type: PREFERENCES_SAVE_SUCCESS,
				key: 'foo',
				value: 'bar',
			} );

			expect( state ).toEqual( {
				baz: 'qux',
			} );
		} );
	} );

	describe( 'remoteValues()', () => {
		test( 'should default to null', () => {
			const state = remoteValues( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set its state to received preferences values', () => {
			const state = remoteValues( undefined, {
				type: PREFERENCES_RECEIVE,
				values: {
					foo: 'bar',
				},
			} );

			expect( state ).toEqual( {
				foo: 'bar',
			} );
		} );

		test( 'should replace its state with the next received values', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );
			const state = remoteValues( original, {
				type: PREFERENCES_RECEIVE,
				values: {
					baz: 'qux',
				},
			} );

			expect( state ).toEqual( {
				baz: 'qux',
			} );
		} );

		test( 'should default undefined value to an empty object', () => {
			const state = remoteValues( null, {
				type: PREFERENCES_RECEIVE,
				values: undefined,
			} );

			expect( state ).toEqual( {} );
		} );
	} );

	describe( 'fetching()', () => {
		test( 'should default to false', () => {
			const state = fetching( undefined, {} );
			expect( state ).toEqual( false );
		} );
		test( 'should update fetching state on fetch', () => {
			const state = fetching( undefined, {
				type: PREFERENCES_FETCH,
			} );
			expect( state ).toEqual( true );
		} );
		test( 'should update fetching state on success', () => {
			const state = fetching( true, {
				type: PREFERENCES_FETCH_SUCCESS,
			} );
			expect( state ).toEqual( false );
		} );
		test( 'should update fetching state on failure', () => {
			const original = { all: true };
			const state = fetching( original, {
				type: PREFERENCES_FETCH_FAILURE,
			} );
			expect( state ).toEqual( false );
		} );
	} );
} );
