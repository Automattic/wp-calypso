/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { requestUserDevices, userDevicesAdd } from '../actions';
import { USER_DEVICES_REQUEST, USER_DEVICES_ADD } from 'client/state/action-types';

describe( 'actions', () => {
	describe( '#requestUserDevices()', () => {
		test( 'should return an action object', () => {
			const action = requestUserDevices();

			expect( action ).to.eql( {
				type: USER_DEVICES_REQUEST,
			} );
		} );
	} );

	describe( '#userDevicesRequestSuccess()', () => {
		test( 'should return an action object', () => {
			const devices = {
				1: { id: 1, name: 'Mobile Phone' },
				2: { id: 2, name: 'Tablet' },
			};
			const action = userDevicesAdd( { devices } );

			expect( action ).to.eql( {
				type: USER_DEVICES_ADD,
				devices,
			} );
		} );
	} );
} );
