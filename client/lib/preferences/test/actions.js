/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	expect = require( 'chai' ).use( sinonChai ).expect,
	rewire = require( 'rewire' ),
	store = require( 'store' ),
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	PreferencesConstants = require( '../constants' );

var DUMMY_PERSISTED_PREFERENCES = { saved: true };

describe( 'PreferencesActions', function() {
	var sandbox, PreferencesActions, getSettings, postSettings;

	beforeEach( function() {
		var dummyPersistedResponse = {};
		dummyPersistedResponse[ PreferencesConstants.USER_SETTING_KEY ] = DUMMY_PERSISTED_PREFERENCES;

		localStorage.clear();

		sandbox = sinon.sandbox.create();
		sandbox.stub( store, 'get' );
		sandbox.stub( store, 'set' );
		getSettings = sandbox.stub().callsArgWithAsync( 0, null, dummyPersistedResponse );
		postSettings = sandbox.stub().callsArgAsync( 1 );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( Dispatcher, 'handleServerAction' );

		mockery.enable( { warnOnReplace: false, warnOnUnregistered: false } );
		mockery.registerMock( 'lib/wp', {
			undocumented: function() {
				return {
					me: function() {
						return {
							settings: getSettings,
							saveSettings: postSettings
						};
					}
				};
			}
		} );

		PreferencesActions = rewire( '../actions' );
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( '#fetch()', function() {
		it( 'should retrieve from localStorage and trigger a request to the REST API', function( done ) {
			var expectedLocalDispatchData = {};
			expectedLocalDispatchData[ PreferencesConstants.USER_SETTING_KEY ] = DUMMY_PERSISTED_PREFERENCES;

			store.get.restore();
			sandbox.stub( store, 'get' ).returns( DUMMY_PERSISTED_PREFERENCES );

			PreferencesActions.fetch();

			expect( store.get ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY );
			expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( { type: 'RECEIVE_ME_SETTINGS', data: expectedLocalDispatchData } );
			expect( getSettings ).to.have.been.calledOnce;
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledTwice;
				expect( store.set ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY, DUMMY_PERSISTED_PREFERENCES );

				done();
			} );
		} );

		it( 'should not persist to localStorage from remote request if error occurs', function( done ) {
			var mergePreferencesToLocalStorage = sinon.stub();

			getSettings = sandbox.stub().callsArgWithAsync( 0, true );

			PreferencesActions.__with__( {
				mergePreferencesToLocalStorage: mergePreferencesToLocalStorage
			} )( function() {
				PreferencesActions.fetch();
				process.nextTick( function() {
					expect( mergePreferencesToLocalStorage ).to.not.have.been.called;
					done();
				} );
			} );
		} );

		it( 'should not dispatch an empty local store', function() {
			store.get.restore();
			sandbox.stub( store, 'get' ).returns( undefined );

			PreferencesActions.fetch();

			expect( store.get ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY );
			expect( Dispatcher.handleServerAction ).to.not.have.been.called;
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledOnce;
				expect( store.set ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY, {} );

				done();
			} );
		} );
	} );

	describe( '#set()', function() {
		it( 'should save to localStorage and trigger a request to the REST API', function( done ) {
			var expectedPayload;

			PreferencesActions.set( 'one', 1 );

			expectedPayload = {};
			expectedPayload[ PreferencesConstants.USER_SETTING_KEY ] = { one: 1 };

			expect( store.set ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY, { one: 1 } );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( { type: 'UPDATE_ME_SETTINGS' } );
			expect( postSettings ).to.have.been.calledWithMatch( JSON.stringify( expectedPayload ) );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( { type: 'RECEIVE_ME_SETTINGS' } );

				done();
			} );
		} );

		it( 'should add to, not replace, existing values', function() {
			var expectedPayload;

			store.get.restore();
			sandbox.stub( store, 'get' ).returns( { one: 1 } );
			PreferencesActions.set( 'two', 2 );

			expectedPayload = {};
			expectedPayload[ PreferencesConstants.USER_SETTING_KEY ] = { two: 2 };

			expect( store.set ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY, { one: 1, two: 2 } );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( { type: 'UPDATE_ME_SETTINGS', data: expectedPayload } );
		} );

		it( 'should assume a null value is to be removed', function() {
			var expectedPayload;

			PreferencesActions.set( 'one', 1 );
			PreferencesActions.set( 'one', null );

			expectedPayload = {};
			expectedPayload[ PreferencesConstants.USER_SETTING_KEY ] = { one: null };

			expect( store.set ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY, { one: 1 } );
			expect( store.set ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY, {} );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( { type: 'UPDATE_ME_SETTINGS', data: expectedPayload } );
		} );

		it( 'should only dispatch a receive after all pending updates have finished', function( done ) {
			var expectedPayload;

			PreferencesActions.set( 'one', 1 );
			PreferencesActions.set( 'one', null );

			expectedPayload = {};
			expectedPayload[ PreferencesConstants.USER_SETTING_KEY ] = { one: null };

			process.nextTick( function() {
				expect( postSettings ).to.have.been.calledTwice;
				expect( Dispatcher.handleServerAction ).to.have.been.calledOnce;
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( { type: 'RECEIVE_ME_SETTINGS' } );
				done();
			} );
		} );
	} );

	describe( '#remove()', function() {
		it( 'should remove from localStorage and trigger a request to the REST API', function( done ) {
			var expectedPayload;

			PreferencesActions.set( 'one', 1 );
			PreferencesActions.remove( 'one' );

			expectedPayload = {};
			expectedPayload[ PreferencesConstants.USER_SETTING_KEY ] = { one: 1 };

			expect( store.set ).to.have.been.calledWith( PreferencesConstants.LOCALSTORAGE_KEY, {} );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( { type: 'UPDATE_ME_SETTINGS', data: expectedPayload } );
			expect( postSettings ).to.have.been.calledWithMatch( JSON.stringify( expectedPayload ) );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( { type: 'RECEIVE_ME_SETTINGS' } );

				done();
			} );
		} );
	} );
} );
