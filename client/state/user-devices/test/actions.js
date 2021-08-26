import { USER_DEVICES_REQUEST, USER_DEVICES_ADD } from 'calypso/state/action-types';
import { requestUserDevices, userDevicesAdd } from '../actions';

describe( 'requestUserDevices()', () => {
	test( 'should return an action object', () => {
		const action = requestUserDevices();

		expect( action ).toEqual( {
			type: USER_DEVICES_REQUEST,
		} );
	} );
} );

describe( 'userDevicesAdd()', () => {
	test( 'should return an action object', () => {
		const devices = {
			1: { id: 1, name: 'Mobile Phone' },
			2: { id: 2, name: 'Tablet' },
		};
		const action = userDevicesAdd( devices );

		expect( action ).toEqual( {
			type: USER_DEVICES_ADD,
			devices,
		} );
	} );
} );
