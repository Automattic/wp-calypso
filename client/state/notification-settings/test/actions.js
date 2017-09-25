/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { requestNotificationSettings, updateNotificationSettings } from '../actions';
import { NOTIFICATION_SETTINGS_REQUEST, NOTIFICATION_SETTINGS_UPDATE } from 'state/action-types';

describe( 'actions', () => {
	describe( '#requestNotificationSettings()', () => {
		it( 'should return an action object', () => {
			const action = requestNotificationSettings();

			expect( action ).to.eql( { type: NOTIFICATION_SETTINGS_REQUEST } );
		} );
	} );

	describe( '#updateNotificationSettings()', () => {
		it( 'should return an action object', () => {
			const settings = {};
			const action = updateNotificationSettings( { settings } );

			expect( action ).to.eql( { type: NOTIFICATION_SETTINGS_UPDATE, settings } );
		} );
	} );
} );
