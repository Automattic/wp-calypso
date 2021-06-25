/**
 * Internal dependencies
 */
import { requestUserDevices, handleSuccess, handleError } from '../';
import { NOTICE_CREATE, USER_DEVICES_ADD } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'requestUserDevices()', () => {
	test( 'should return an action for an HTTP request to the users devices endpoint', () => {
		const action = requestUserDevices();

		expect( action ).toEqual(
			http( {
				apiVersion: '1.1',
				method: 'GET',
				path: '/notifications/devices',
			} )
		);
	} );
} );

describe( 'handleSuccess()', () => {
	test( 'should return an action to add user devices', () => {
		const devices = {
			1: { id: 1, name: 'Mobile Phone' },
			2: { id: 2, name: 'Tablet' },
		};

		const action = handleSuccess( null, devices );

		expect( action ).toEqual( {
			type: USER_DEVICES_ADD,
			devices,
		} );
	} );
} );

describe( 'handleError()', () => {
	test( 'should return an action for an error notice', () => {
		const action = handleError();

		expect( action ).toMatchObject( {
			type: NOTICE_CREATE,
			notice: {
				status: 'is-error',
			},
		} );
	} );
} );
