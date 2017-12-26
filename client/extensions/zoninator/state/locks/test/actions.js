/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { ZONINATOR_REQUEST_LOCK, ZONINATOR_UPDATE_LOCK } from '../../action-types';
import { requestLock, updateLock } from '../actions';

const siteId = 1234;
const zoneId = 5678;
const refresh = true;
const created = new Date();
const currentSession = true;

describe( 'actions', () => {
	describe( 'updateLock()', () => {
		test( 'should return an action object', () => {
			const action = updateLock( siteId, zoneId, currentSession, created );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_UPDATE_LOCK,
				siteId,
				zoneId,
				currentSession,
				created,
			} );
		} );

		test( 'should set `created` to the current date if no value is provided', () => {
			const action = updateLock( siteId, zoneId, currentSession );

			expect( omit( action, [ 'created' ] ) ).to.deep.equal( {
				type: ZONINATOR_UPDATE_LOCK,
				siteId,
				zoneId,
				currentSession,
			} );
			expect( action.created ).to.exist;
		} );
	} );

	describe( 'requestLock()', () => {
		const action = requestLock( siteId, zoneId, refresh );

		expect( action ).to.deep.equal( {
			type: ZONINATOR_REQUEST_LOCK,
			siteId,
			zoneId,
			refresh,
		} );
	} );
} );
