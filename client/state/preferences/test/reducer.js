/**
 * External dependencies
 */
import { expect } from 'chai';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { createReducerForPreferenceKey, fetching } from '../reducer';
import { DEFAULT_PREFERENCES, USER_SETTING_KEY } from '../constants';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'values',
			'fetching',
			'lastFetchedTimestamp'
		] );
	} );

	describe( '#values()', () => {
		it( 'should export reducer keys defined in constants/DEFAULT_PREFERENCES', () => {
			expect( reducer( undefined, {} ).values ).to.have.keys( Object.keys( DEFAULT_PREFERENCES ) );
		} );

		it( 'should use DEFAULT_PREFERENCES from constants as a default', () => {
			expect( reducer( undefined, {} ).values ).to.deep.equal( mapValues( DEFAULT_PREFERENCES, value => value.default ) );
		} );
	} );

	describe( '#fetching()', () => {
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

	describe( '#createReducerForPreferenceKey()', () => {
		const optionKey = 'theBestKeyEver';
		const defaultValue = 'the best default value you will ever see';
		const keyReducer = createReducerForPreferenceKey( optionKey, defaultValue, { type: 'string' } );

		it( 'should create a reducer', () => {
			expect( keyReducer ).to.be.a( 'function' );
		} );

		describe( 'created reducer', () => {
			it( `should default to "${ defaultValue }"`, () => {
				const state = keyReducer( undefined, {} );
				expect( state ).to.eql( defaultValue );
			} );

			it( 'updates the value when key matches', () => {
				const state = keyReducer( 'original value', {
					type: PREFERENCES_SET,
					key: optionKey,
					value: 'new value'
				} );
				expect( state ).to.eql( 'new value' );
			} );

			it( 'does not update the value when key does not match', () => {
				const state = keyReducer( 'original value', {
					type: PREFERENCES_SET,
					key: 'different key',
					value: 'new value'
				} );
				expect( state ).to.eql( 'original value' );
			} );

			[ PREFERENCES_FETCH_SUCCESS, PREFERENCES_RECEIVE ].forEach( actionType => {
				describe( `action type "${ actionType }"`, () => {
					it( `updates the value when key matches`, () => {
						const state = keyReducer( 'original value', {
							type: actionType,
							data: {
								[ USER_SETTING_KEY ]: {
									[ optionKey ]: 'new value',
									differentKey: 'differentValue'
								}
							}
						} );
						expect( state ).to.eql( 'new value' );
					} );

					it( 'does not update the value when key does not match', () => {
						const state = keyReducer( 'original value', {
							type: actionType,
							data: {
								[ USER_SETTING_KEY ]: {
									differentKey: 'differentValue'
								}
							}
						} );
						expect( state ).to.eql( 'original value' );
					} );
				} );
			} );

			it( 'should persist state', () => {
				const state = keyReducer( 'super value', {
					type: SERIALIZE
				} );
				expect( state ).to.eql( 'super value' );
			} );
			it( 'should load persisted state', () => {
				const state = keyReducer( 'another awesome value', {
					type: DESERIALIZE
				} );
				expect( state ).to.eql( 'another awesome value' );
			} );
		} );
	} );
} );
