/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { USER_DEVICES_REQUEST, USER_DEVICES_ADD } from 'state/action-types';
import { requestUserDevices, userDevicesAdd } from '../actions';

describe( 'actions', () => {
	describe( '#requestUserDevices()', () => {
		it( 'should return an action object', () => {
			const action = requestUserDevices();

			expect( action ).to.eql( {
				type: USER_DEVICES_REQUEST,
			} );
		} );
	} );

	describe( '#userDevicesRequestSuccess()', () => {
		it( 'should return an action object', () => {
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
