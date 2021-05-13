/**
 * External dependencies
 */
import { expect } from 'chai';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_LOCK,
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_RESET_LOCK,
	ZONINATOR_UPDATE_LOCK,
} from '../../action-types';
import { requestLock, requestLockError, resetLock, updateLock } from '../actions';

const siteId = 1234;
const zoneId = 5678;
const expires = new Date();
const maxLockPeriod = 600;

describe( 'actions', () => {
	describe( 'updateLock()', () => {
		test( 'should return an action object', () => {
			const action = updateLock( siteId, zoneId, expires, maxLockPeriod );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_UPDATE_LOCK,
				siteId,
				zoneId,
				expires,
				maxLockPeriod,
			} );
		} );
	} );

	describe( 'requestLock()', () => {
		test( 'should return an action object', () => {
			const action = requestLock( siteId, zoneId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_REQUEST_LOCK,
				siteId,
				zoneId,
			} );
		} );
	} );

	describe( 'requestLockError()', () => {
		test( 'should return an action object', () => {
			const action = requestLockError( siteId, zoneId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_REQUEST_LOCK_ERROR,
				siteId,
				zoneId,
			} );
		} );
	} );

	describe( 'resetLock()', () => {
		test( 'should return an action object with the current time', () => {
			const before = new Date().getTime();
			const action = resetLock( siteId, zoneId );
			const after = new Date().getTime();

			expect( omit( action, [ 'time' ] ) ).to.deep.equal( {
				type: ZONINATOR_RESET_LOCK,
				siteId,
				zoneId,
			} );
			expect( action.time ).to.be.within( before, after );
		} );
	} );
} );
