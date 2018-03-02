/** @format */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, loaded } from '../reducer';
import { GOOGLE_APPS_USERS_FETCH, GOOGLE_APPS_USERS_FETCH_COMPLETED } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty array', () => {
			const state = items( undefined, {} );

			assert.deepEqual( state, [] );
		} );

		test( 'should return new items received', () => {
			const state = items( deepFreeze( [ { email: 'hello@world.com' } ] ), {
				type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
				items: [ { email: 'hi@world.com' } ],
			} );

			assert.deepEqual( state, [ { email: 'hello@world.com' }, { email: 'hi@world.com' } ] );
		} );

		test( 'should not have duplicate items', () => {
			const state = items( deepFreeze( [ { email: 'hello@world.com' } ] ), {
				type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
				items: [ { email: 'hi@world.com' }, { email: 'hello@world.com' } ],
			} );

			assert.deepEqual( state, [ { email: 'hello@world.com' }, { email: 'hi@world.com' } ] );
		} );
	} );

	describe( '#loaded()', () => {
		test( 'should default to false', () => {
			assert( loaded( undefined, {} ) === false );
		} );
		test( 'should be true after a receive', () => {
			assert( loaded( undefined, { type: GOOGLE_APPS_USERS_FETCH_COMPLETED } ) === true );
		} );
		test( 'should return false when a fetch starts', () => {
			assert( loaded( true, { type: GOOGLE_APPS_USERS_FETCH } ) === false );
		} );
	} );
} );
