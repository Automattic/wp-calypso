/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_RESET_LOCK,
	ZONINATOR_UPDATE_LOCK,
} from '../../action-types';
import { blocked, created, expires, items, maxLockPeriod } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( items( undefined, {} ) ).to.have.keys( [
			'blocked',
			'created',
			'expires',
			'maxLockPeriod',
		] );
	} );

	describe( 'blocked()', () => {
		test( 'should default to false', () => {
			const state = blocked( undefined, {} );

			expect( state ).to.deep.equal( false );
		} );

		test( 'should set state to false when updating a lock', () => {
			const state = blocked( undefined, {
				type: ZONINATOR_UPDATE_LOCK,
			} );

			expect( state ).to.deep.equal( false );
		} );

		test( 'should set state to true state when a lock error occurs', () => {
			const state = blocked( undefined, {
				type: ZONINATOR_REQUEST_LOCK_ERROR,
			} );

			expect( state ).to.deep.equal( true );
		} );
	} );

	describe( 'created()', () => {
		test( 'should default to 0', () => {
			const state = created( undefined, {} );

			expect( state ).to.deep.equal( 0 );
		} );

		test( 'should set the state to the given time when a lock is reset', () => {
			const time = new Date().getTime();
			const state = created( undefined, {
				type: ZONINATOR_RESET_LOCK,
				time,
			} );

			expect( state ).to.deep.equal( time );
		} );
	} );

	describe( 'expires()', () => {
		test( 'should default to 0', () => {
			const state = expires( undefined, {} );

			expect( state ).to.deep.equal( 0 );
		} );

		test( 'should set the state to the given expiry time when a lock is updated', () => {
			const time = new Date().getTime();
			const state = expires( undefined, {
				type: ZONINATOR_UPDATE_LOCK,
				expires: time,
			} );

			expect( state ).to.deep.equal( time );
		} );
	} );

	describe( 'maxLockPeriod()', () => {
		test( 'should default to 0', () => {
			const state = maxLockPeriod( undefined, {} );

			expect( state ).to.deep.equal( 0 );
		} );

		test( 'should set the state to the given maximum lock period when a lock is updated', () => {
			const timeout = 600;
			const state = maxLockPeriod( undefined, {
				type: ZONINATOR_UPDATE_LOCK,
				maxLockPeriod: timeout,
			} );

			expect( state ).to.deep.equal( timeout );
		} );
	} );
} );
