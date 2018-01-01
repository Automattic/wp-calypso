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
import { requestLock, requestLockError, updateLock } from '../actions';

const siteId = 1234;
const zoneId = 5678;
const expires = new Date();
const maxLockPeriod = 600;
const blocked = true;
const reset = true;

describe( 'actions', () => {
	describe( 'updateLock()', () => {
		test( 'should return an action object', () => {
			const action = updateLock( siteId, zoneId, expires, maxLockPeriod, reset );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_UPDATE_LOCK,
				siteId,
				zoneId,
				expires,
				maxLockPeriod,
				reset,
			} );
		} );
	} );

	describe( 'requestLock()', () => {
		const action = requestLock( siteId, zoneId, reset );

		expect( action ).to.deep.equal( {
			type: ZONINATOR_REQUEST_LOCK,
			siteId,
			zoneId,
			reset,
		} );
	} );

	describe( 'requestLockError()', () => {
		const action = requestLockError( siteId, zoneId, blocked );

		expect( action ).to.deep.equal( {
			type: ZONINATOR_REQUEST_LOCK_ERROR,
			siteId,
			zoneId,
			blocked,
		} );
	} );
} );
