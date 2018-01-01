/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_LOCK,
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_UPDATE_LOCK,
} from '../../action-types';
import reducer, { blocked, created, items, requesting, maxLockPeriod } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'blocked',
			'created',
			'items',
			'maxLockPeriod',
		] );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should set state to true if a lock is being requested', () => {
			const state = requesting( undefined, {
				type: ZONINATOR_REQUEST_LOCK,
				siteId: 123,
				zoneId: 456,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: true,
				},
			} );
		} );

		test( 'should set state to false when updating a lock', () => {
			const state = requesting( undefined, {
				type: ZONINATOR_UPDATE_LOCK,
				siteId: 123,
				zoneId: 456,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: false,
				},
			} );
		} );

		test( 'should set state to false after failing to set a lock', () => {
			const state = requesting( undefined, {
				type: ZONINATOR_REQUEST_LOCK_ERROR,
				siteId: 123,
				zoneId: 456,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: false,
				},
			} );
		} );
	} );

	describe( 'blocked()', () => {
		test( 'should default to an empty object', () => {
			const state = blocked( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should set state to false when updating a lock', () => {
			const state = blocked( undefined, {
				type: ZONINATOR_UPDATE_LOCK,
				siteId: 123,
				zoneId: 456,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: false,
				},
			} );
		} );

		test( 'should set state to true state when a lock is blocked', () => {
			const state = blocked( undefined, {
				type: ZONINATOR_REQUEST_LOCK_ERROR,
				siteId: 123,
				zoneId: 456,
				blocked: true,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: true,
				},
			} );
		} );

		test( "should set state to false when failed to set a lock that wasn't blocked", () => {
			const state = blocked( undefined, {
				type: ZONINATOR_REQUEST_LOCK_ERROR,
				siteId: 123,
				zoneId: 456,
				blocked: false,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: false,
				},
			} );
		} );
	} );

	describe( 'created()', () => {
		test( 'should default to an empty object', () => {
			const state = created( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should leave the state unchanged if reset is set to false', () => {
			const before = {
				[ 123 ]: {
					[ 456 ]: 123456789,
				},
			};
			const state = created( before, {
				type: ZONINATOR_UPDATE_LOCK,
				siteId: 123,
				zoneId: 456,
				reset: false,
			} );

			expect( state ).to.deep.equal( before );
		} );

		test( 'should set the state to the current time if reset is set to true', () => {
			const before = new Date().getTime();
			const state = created( undefined, {
				type: ZONINATOR_UPDATE_LOCK,
				siteId: 123,
				zoneId: 456,
				reset: true,
			} );
			const after = new Date().getTime();

			expect( state[ 123 ][ 456 ] ).to.be.within( before, after );
		} );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( 'maxLockPeriod()', () => {
		test( 'should default to an empty object', () => {
			const state = maxLockPeriod( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
