/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	NOTIFICATION_SETTINGS_REQUEST,
	NOTIFICATION_SETTINGS_RECEIVE,
} from 'state/action-types';
import {
	requestNotificationSettings,
	receiveNotificationSettings,
} from '../actions';

describe( 'actions', () => {
	describe( '#requestNotificationSettings()', () => {
		it( 'should return an action object', () => {
			const action = requestNotificationSettings();

			expect( action ).to.eql( { type: NOTIFICATION_SETTINGS_REQUEST } );
		} );
	} );

	describe( '#receiveNotificationSettings()', () => {
		it( 'should return an action object', () => {
			const settings = {};
			const action = receiveNotificationSettings( { settings } );

			expect( action ).to.eql( { type: NOTIFICATION_SETTINGS_RECEIVE, settings } );
		} );
	} );
} );
