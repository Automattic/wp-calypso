/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	USER_DEVICES_REQUEST,
	USER_DEVICES_REQUEST_FAILURE,
	USER_DEVICES_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	requestUserDevices,
	userDevicesRequestSuccess,
	userDevicesRequestFailure
} from '../actions';

describe( 'actions', () => {
	describe( '#requestUserDevices()', () => {
		it( 'should return an action object', () => {
			const action = requestUserDevices();

			expect( action ).to.eql( {
				type: USER_DEVICES_REQUEST
			} );
		} );
	} );

	describe( '#userDevicesRequestSuccess()', () => {
		it( 'should return an action object', () => {
			const devices = [
				{ device_id: 1 },
				{ device_id: 2 }
			];
			const action = userDevicesRequestSuccess( { devices } );

			expect( action ).to.eql( {
				type: USER_DEVICES_REQUEST_SUCCESS,
				devices
			} );
		} );
	} );

	describe( '#userDevicesRequestFailure()', () => {
		it( 'should return an action object', () => {
			const action = userDevicesRequestFailure();

			expect( action ).to.eql( {
				type: USER_DEVICES_REQUEST_FAILURE
			} );
		} );
	} );
} );
