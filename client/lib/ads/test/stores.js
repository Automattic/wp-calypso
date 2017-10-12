/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
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
		expect( typeof EarningsStore ).toBe( 'object' );
		expect( typeof SettingsStore ).toBe( 'object' );
		expect( typeof TosStore ).toBe( 'object' );
	} );

	test( 'Stores should have method getById', () => {
		expect( typeof EarningsStore.getById ).toBe( 'function' );
		expect( typeof SettingsStore.getById ).toBe( 'function' );
		expect( typeof TosStore.getById ).toBe( 'function' );
	} );

	test( 'Stores should have method emitChange', () => {
		expect( typeof EarningsStore.emitChange ).toBe( 'function' );
		expect( typeof SettingsStore.emitChange ).toBe( 'function' );
		expect( typeof TosStore.emitChange ).toBe( 'function' );
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

			expect( typeof earnings ).toBe( 'object' );
			expect( typeof settings ).toBe( 'object' );
			expect( typeof tos ).toBe( 'object' );
		} );

		test( 'The object should not be null after RECEIVE', () => {
			var earnings = EarningsStore.getById( site.ID ),
				settings = SettingsStore.getById( site.ID ),
				tos = TosStore.getById( site.ID );

			expect( earnings.earnings ).not.toBeNull();
			expect( settings.settings ).not.toBeNull();
			expect( tos.tos ).not.toBeNull();
		} );
	} );
} );
