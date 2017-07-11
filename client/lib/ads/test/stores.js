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

describe( 'Ads Stores; EarningsStore, SettingsStore, TosStore', function() {
	let Dispatcher, EarningsStore, SettingsStore, TosStore;

	before( function() {
		Dispatcher = require( 'dispatcher' );
		EarningsStore = require( 'lib/ads/earnings-store' );
		SettingsStore = require( 'lib/ads/settings-store' );
		TosStore = require( 'lib/ads/tos-store' );
	} );

	it( 'Stores should be an object', function() {
		assert.isObject( EarningsStore );
		assert.isObject( SettingsStore );
		assert.isObject( TosStore );
	} );

	it( 'Stores should have method getById', function() {
		assert.isFunction( EarningsStore.getById );
		assert.isFunction( SettingsStore.getById );
		assert.isFunction( TosStore.getById );
	} );

	it( 'Stores should have method emitChange', function() {
		assert.isFunction( EarningsStore.emitChange );
		assert.isFunction( SettingsStore.emitChange );
		assert.isFunction( TosStore.emitChange );
	} );

	describe( 'Fetch', function() {
		before( function() {
			Dispatcher.handleServerAction( actions.fetchedEarnings );
			Dispatcher.handleServerAction( actions.fetchedSettings );
			Dispatcher.handleServerAction( actions.fetchedTos );
		} );

		it( 'The store should return an object', function() {
			var earnings = EarningsStore.getById( site.ID ),
				settings = SettingsStore.getById( site.ID ),
				tos = TosStore.getById( site.ID );

			assert.isObject( earnings );
			assert.isObject( settings );
			assert.isObject( tos );
		} );

		it( 'The object should not be null after RECEIVE', function() {
			var earnings = EarningsStore.getById( site.ID ),
				settings = SettingsStore.getById( site.ID ),
				tos = TosStore.getById( site.ID );

			assert.isNotNull( earnings.earnings );
			assert.isNotNull( settings.settings );
			assert.isNotNull( tos.tos );
		} );
	} );
} );
