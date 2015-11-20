/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	PreferencesConstants = require( '../constants' );

describe( 'PreferencesStore', function() {
	var PreferencesStore, handler;

	before( function() {
		sinon.spy( Dispatcher, 'register' );
	} );

	beforeEach( function() {
		delete require.cache[ require.resolve( '../store' ) ];
		PreferencesStore = require( '../store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	after( function() {
		Dispatcher.register.restore();
	} );

	function dispatchReceivePreferences( preferences ) {
		var data = {};
		data[ PreferencesConstants.USER_SETTING_KEY ] = preferences;

		handler( {
			action: {
				type: 'RECEIVE_ME_SETTINGS',
				data: data
			}
		} );
	}

	describe( '#getAll()', function() {
		it( 'should return undefined if preferences have never been received', function() {
			expect( PreferencesStore.getAll() ).to.be.undefined;
		} );

		it( 'should return an empty object if preferences were received but empty', function() {
			dispatchReceivePreferences( {} );

			expect( PreferencesStore.getAll() ).to.eql( {} );
		} );

		it( 'should return all received preferences', function() {
			dispatchReceivePreferences( { one: 1 } );

			expect( PreferencesStore.getAll() ).to.eql( { one: 1 } );
		} );

		it( 'should merge multiple received preferences', function() {
			dispatchReceivePreferences( { one: 1 } );
			dispatchReceivePreferences( { two: 2 } );

			expect( PreferencesStore.getAll() ).to.eql( { one: 1, two: 2 } );
		} );
	} );

	describe( '#get()', function() {
		it( 'should return a single value', function() {
			dispatchReceivePreferences( { one: 1 } );

			expect( PreferencesStore.get( 'one' ) ).to.equal( 1 );
		} );

		it( 'should return undefined for a key which was never defined', function() {
			expect( PreferencesStore.get( 'one' ) ).to.be.undefined;
		} );

		it( 'should return undefined for a key which was removed', function() {
			dispatchReceivePreferences( { one: 1 } );
			dispatchReceivePreferences( { one: null } );

			expect( PreferencesStore.get( 'one' ) ).to.be.undefined;
		} );
	} );

	describe( '.dispatchToken', function() {
		it( 'should emit a change event when receiving updates', function( done ) {
			PreferencesStore.on( 'change', done );

			dispatchReceivePreferences( {} );
		} );
	} );
} );
