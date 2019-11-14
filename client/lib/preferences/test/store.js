/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { USER_SETTING_KEY } from '../constants';

describe( 'PreferencesStore', () => {
	let Dispatcher, PreferencesStore, handler;

	beforeAll( function() {
		Dispatcher = require( 'dispatcher' );
		sinon.spy( Dispatcher, 'register' );
		PreferencesStore = require( '../store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( () => {
		PreferencesStore._preferences = undefined;
	} );

	afterAll( function() {
		Dispatcher.register.restore();
	} );

	function dispatchReceivePreferences( preferences ) {
		handler( {
			action: {
				type: 'RECEIVE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: preferences,
				},
			},
		} );
	}

	describe( '#getAll()', () => {
		test( 'should return undefined if preferences have never been received', () => {
			expect( PreferencesStore.getAll() ).to.be.undefined;
		} );

		test( 'should return an empty object if preferences were received but empty', () => {
			dispatchReceivePreferences( {} );

			expect( PreferencesStore.getAll() ).to.eql( {} );
		} );

		test( 'should return all received preferences', () => {
			dispatchReceivePreferences( { one: 1 } );

			expect( PreferencesStore.getAll() ).to.eql( { one: 1 } );
		} );

		test( 'should merge multiple received preferences', () => {
			dispatchReceivePreferences( { one: 1 } );
			dispatchReceivePreferences( { two: 2 } );

			expect( PreferencesStore.getAll() ).to.eql( { one: 1, two: 2 } );
		} );
	} );

	describe( '#get()', () => {
		test( 'should return a single value', () => {
			dispatchReceivePreferences( { one: 1 } );

			expect( PreferencesStore.get( 'one' ) ).to.equal( 1 );
		} );

		test( 'should return undefined for a key which was never defined', () => {
			expect( PreferencesStore.get( 'one' ) ).to.be.undefined;
		} );

		test( 'should return undefined for a key which was removed', () => {
			dispatchReceivePreferences( { one: 1 } );
			dispatchReceivePreferences( { one: null } );

			expect( PreferencesStore.get( 'one' ) ).to.be.undefined;
		} );
	} );

	describe( '.dispatchToken', () => {
		test( 'should emit a change event when receiving updates', done => {
			PreferencesStore.on( 'change', done );

			dispatchReceivePreferences( {} );
		} );
	} );
} );
