/** @format */
/**
 * External dependencies
 */
import assert from 'assert';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { GOOGLE_APPS_USERS_FETCH, GOOGLE_APPS_USERS_FETCH_COMPLETED } from 'state/action-types';

import { items, loaded } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty array', () => {
			const state = items( undefined, {} );

			assert.deepEqual( state, [] );
		} );

		it( 'should return new items received', () => {
			const state = items( deepFreeze( [ { email: 'hello@world.com' } ] ), {
				type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
				items: [ { email: 'hi@world.com' } ],
			} );

			assert.deepEqual( state, [ { email: 'hello@world.com' }, { email: 'hi@world.com' } ] );
		} );

		it( 'should not have duplicate items', () => {
			const state = items( deepFreeze( [ { email: 'hello@world.com' } ] ), {
				type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
				items: [ { email: 'hi@world.com' }, { email: 'hello@world.com' } ],
			} );

			assert.deepEqual( state, [ { email: 'hello@world.com' }, { email: 'hi@world.com' } ] );
		} );
	} );

	describe( '#loaded()', () => {
		it( 'should default to false', () => {
			assert( loaded( undefined, {} ) === false );
		} );
		it( 'should be true after a receive', () => {
			assert( loaded( undefined, { type: GOOGLE_APPS_USERS_FETCH_COMPLETED } ) === true );
		} );
		it( 'should return false when a fetch starts', () => {
			assert( loaded( true, { type: GOOGLE_APPS_USERS_FETCH } ) === false );
		} );
	} );
} );
