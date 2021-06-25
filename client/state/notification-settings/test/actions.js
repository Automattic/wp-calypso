/**
 * Internal dependencies
 */
import { requestNotificationSettings, updateNotificationSettings } from '../actions';
import {
	NOTIFICATION_SETTINGS_REQUEST,
	NOTIFICATION_SETTINGS_UPDATE,
} from 'calypso/state/action-types';

describe( 'requestNotificationSettings()', () => {
	test( 'should return an action object', () => {
		const action = requestNotificationSettings();

		expect( action ).toEqual( { type: NOTIFICATION_SETTINGS_REQUEST } );
	} );
} );

describe( 'updateNotificationSettings()', () => {
	test( 'should return an action object', () => {
		const settings = {};
		const action = updateNotificationSettings( settings );

		expect( action ).toEqual( { type: NOTIFICATION_SETTINGS_UPDATE, settings } );
	} );
} );
