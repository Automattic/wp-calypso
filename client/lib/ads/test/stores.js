/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import actions from './lib/mock-actions';
import site from './lib/mock-site';

describe( 'Ads Stores; SettingsStore, TosStore', () => {
	let Dispatcher, SettingsStore;

	beforeAll( function() {
		Dispatcher = require( 'dispatcher' );
		SettingsStore = require( 'lib/ads/settings-store' );
	} );

	test( 'Stores should be an object', () => {
		assert.isObject( SettingsStore );
	} );

	test( 'Stores should have method getById', () => {
		assert.isFunction( SettingsStore.getById );
	} );

	test( 'Stores should have method emitChange', () => {
		assert.isFunction( SettingsStore.emitChange );
	} );

	describe( 'Fetch', () => {
		beforeAll( function() {
			Dispatcher.handleServerAction( actions.fetchedSettings );
		} );

		test( 'The store should return an object', () => {
			const settings = SettingsStore.getById( site.ID );
			assert.isObject( settings );
		} );

		test( 'The object should not be null after RECEIVE', () => {
			const settings = SettingsStore.getById( site.ID );
			assert.isNotNull( settings.settings );
		} );
	} );
} );
