/**
 * @format
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
	let Dispatcher, SettingsStore, TosStore;

	beforeAll( function() {
		Dispatcher = require( 'dispatcher' );
		SettingsStore = require( 'lib/ads/settings-store' );
		TosStore = require( 'lib/ads/tos-store' );
	} );

	test( 'Stores should be an object', () => {
		assert.isObject( SettingsStore );
		assert.isObject( TosStore );
	} );

	test( 'Stores should have method getById', () => {
		assert.isFunction( SettingsStore.getById );
		assert.isFunction( TosStore.getById );
	} );

	test( 'Stores should have method emitChange', () => {
		assert.isFunction( SettingsStore.emitChange );
		assert.isFunction( TosStore.emitChange );
	} );

	describe( 'Fetch', () => {
		beforeAll( function() {
			Dispatcher.handleServerAction( actions.fetchedSettings );
			Dispatcher.handleServerAction( actions.fetchedTos );
		} );

		test( 'The store should return an object', () => {
			const settings = SettingsStore.getById( site.ID ),
				tos = TosStore.getById( site.ID );

			assert.isObject( settings );
			assert.isObject( tos );
		} );

		test( 'The object should not be null after RECEIVE', () => {
			const settings = SettingsStore.getById( site.ID ),
				tos = TosStore.getById( site.ID );

			assert.isNotNull( settings.settings );
			assert.isNotNull( tos.tos );
		} );
	} );
} );
