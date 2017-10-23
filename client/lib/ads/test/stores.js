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

describe( 'Ads Stores; EarningsStore, SettingsStore, TosStore', () => {
	let Dispatcher, EarningsStore, SettingsStore, TosStore;

	beforeAll( function() {
		Dispatcher = require( 'dispatcher' );
		EarningsStore = require( 'lib/ads/earnings-store' );
		SettingsStore = require( 'lib/ads/settings-store' );
		TosStore = require( 'lib/ads/tos-store' );
	} );

	test( 'Stores should be an object', () => {
		assert.isObject( EarningsStore );
		assert.isObject( SettingsStore );
		assert.isObject( TosStore );
	} );

	test( 'Stores should have method getById', () => {
		assert.isFunction( EarningsStore.getById );
		assert.isFunction( SettingsStore.getById );
		assert.isFunction( TosStore.getById );
	} );

	test( 'Stores should have method emitChange', () => {
		assert.isFunction( EarningsStore.emitChange );
		assert.isFunction( SettingsStore.emitChange );
		assert.isFunction( TosStore.emitChange );
	} );

	describe( 'Fetch', () => {
		beforeAll( function() {
			Dispatcher.handleServerAction( actions.fetchedEarnings );
			Dispatcher.handleServerAction( actions.fetchedSettings );
			Dispatcher.handleServerAction( actions.fetchedTos );
		} );

		test( 'The store should return an object', () => {
			var earnings = EarningsStore.getById( site.ID ),
				settings = SettingsStore.getById( site.ID ),
				tos = TosStore.getById( site.ID );

			assert.isObject( earnings );
			assert.isObject( settings );
			assert.isObject( tos );
		} );

		test( 'The object should not be null after RECEIVE', () => {
			var earnings = EarningsStore.getById( site.ID ),
				settings = SettingsStore.getById( site.ID ),
				tos = TosStore.getById( site.ID );

			assert.isNotNull( earnings.earnings );
			assert.isNotNull( settings.settings );
			assert.isNotNull( tos.tos );
		} );
	} );
} );
