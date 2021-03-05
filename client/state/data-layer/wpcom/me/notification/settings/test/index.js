/**
 * Internal dependencies
 */
import { requestNotificationSettings, updateSettings, handleError } from '../';
import { NOTIFICATION_SETTINGS_UPDATE, NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'requestNotificationSettings()', () => {
	test( 'should return an HTTP action to fetch the user notification settings', () => {
		const action = requestNotificationSettings();

		expect( action ).toEqual(
			http( {
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/notifications/settings',
			} )
		);
	} );
} );

describe( 'updateSettings()', () => {
	test( 'should return a notification settings update action', () => {
		const settings = {};
		const action = updateSettings( null, settings );

		expect( action ).toEqual( {
			type: NOTIFICATION_SETTINGS_UPDATE,
			settings,
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
