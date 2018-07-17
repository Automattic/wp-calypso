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

describe( 'Ads Stores; EarningsStore, SettingsStore', () => {
	let Dispatcher, EarningsStore, SettingsStore;

	beforeAll( function() {
		Dispatcher = require( 'dispatcher' );
		EarningsStore = require( 'lib/ads/earnings-store' );
		SettingsStore = require( 'lib/ads/settings-store' );
	} );

	test( 'Stores should be an object', () => {
		assert.isObject( EarningsStore );
		assert.isObject( SettingsStore );
	} );

	test( 'Stores should have method getById', () => {
		assert.isFunction( EarningsStore.getById );
		assert.isFunction( SettingsStore.getById );
	} );

	test( 'Stores should have method emitChange', () => {
		assert.isFunction( EarningsStore.emitChange );
		assert.isFunction( SettingsStore.emitChange );
	} );

	describe( 'Fetch', () => {
		beforeAll( function() {
			Dispatcher.handleServerAction( actions.fetchedEarnings );
			Dispatcher.handleServerAction( actions.fetchedSettings );
		} );

		test( 'The store should return an object', () => {
			const earnings = EarningsStore.getById( site.ID ),
				settings = SettingsStore.getById( site.ID );

			assert.isObject( earnings );
			assert.isObject( settings );
		} );

		test( 'The object should not be null after RECEIVE', () => {
			const earnings = EarningsStore.getById( site.ID ),
				settings = SettingsStore.getById( site.ID );

			assert.isNotNull( earnings.earnings );
			assert.isNotNull( settings.settings );
		} );
	} );
} );
