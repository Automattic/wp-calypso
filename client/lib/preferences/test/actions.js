/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { USER_SETTING_KEY, LOCALSTORAGE_KEY } from '../constants';
import { useSandbox } from 'test/helpers/use-sinon';
import useMockery from 'test/helpers/use-mockery';
import useNock from 'test/helpers/use-nock';

/**
 * Constants
 */
const DUMMY_PERSISTED_PREFERENCES = { saved: true };

describe( 'PreferencesActions', function() {
	let sandbox, PreferencesActions, getSettings, postSettings;
	const store = { get: noop, set: noop };
	const Dispatcher = { handleViewAction: noop, handleServerAction: noop };

	useSandbox( ( _sandbox ) => sandbox = _sandbox );
	useMockery();
	useNock();

	before( function() {
		mockery.registerMock( 'lib/user/utils', { isLoggedIn: () => true } );
		mockery.registerMock( 'store', store );
		mockery.registerMock( 'dispatcher', Dispatcher );
		mockery.registerMock( 'lib/wp', {
			undocumented: function() {
				return {
					me: function() {
						return {
							settings: function() {
								return {
									get: getSettings,
									update: postSettings
								};
							}
						};
					}
				};
			}
		} );

		PreferencesActions = require( '../actions' );
	} );

	beforeEach( function() {
		sandbox.restore();
		sandbox.stub( store, 'get' );
		sandbox.stub( store, 'set' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( Dispatcher, 'handleServerAction' );

		getSettings = sandbox.stub().callsArgWithAsync( 0, null, {
			[ USER_SETTING_KEY ]: DUMMY_PERSISTED_PREFERENCES
		} );
		postSettings = sandbox.stub().callsArgAsync( 1 );
	} );

	describe( '#fetch()', function() {
		it( 'should retrieve from localStorage and trigger a request to the REST API', function( done ) {
			store.get.restore();
			sandbox.stub( store, 'get' ).returns( DUMMY_PERSISTED_PREFERENCES );

			PreferencesActions.fetch();

			expect( store.get ).to.have.been.calledWith( LOCALSTORAGE_KEY );
			expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: DUMMY_PERSISTED_PREFERENCES
				}
			} );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledTwice;
				expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, DUMMY_PERSISTED_PREFERENCES );
				done();
			} );
		} );

		it( 'should not persist to localStorage from remote request if error occurs', function( done ) {
			sandbox.stub( PreferencesActions, 'mergePreferencesToLocalStorage' );

			getSettings = sandbox.stub().callsArgWithAsync( 0, true );

			PreferencesActions.fetch();
			process.nextTick( function() {
				expect( PreferencesActions.mergePreferencesToLocalStorage ).to.not.have.been.called;
				done();
			} );
		} );

		it( 'should not dispatch an empty local store', function( done ) {
			store.get.restore();
			sandbox.stub( store, 'get' ).returns( undefined );

			PreferencesActions.fetch();

			expect( store.get ).to.have.been.calledWith( LOCALSTORAGE_KEY );
			expect( Dispatcher.handleServerAction ).to.not.have.been.called;

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledOnce;
				expect( store.set ).to.have.been.calledWith(
					LOCALSTORAGE_KEY,
					DUMMY_PERSISTED_PREFERENCES
				);
				done();
			} );
		} );
	} );

	describe( '#set()', function() {
		it( 'should save to localStorage and trigger a request to the REST API', function( done ) {
			PreferencesActions.set( 'one', 1 );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, { one: 1 } );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS'
			} );
			expect( postSettings ).to.have.been.calledWithMatch( JSON.stringify( {
				[ USER_SETTING_KEY ]: { one: 1 }
			} ) );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_ME_SETTINGS'
				} );
				done();
			} );
		} );

		it( 'should add to, not replace, existing values', function() {
			store.get.restore();
			sandbox.stub( store, 'get' ).returns( { one: 1 } );
			PreferencesActions.set( 'two', 2 );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, { one: 1, two: 2 } );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: { two: 2 }
				}
			} );
		} );

		it( 'should assume a null value is to be removed', function() {
			PreferencesActions.set( 'one', 1 );
			PreferencesActions.set( 'one', null );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, { one: 1 } );
			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, {} );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: { one: null }
				}
			} );
		} );

		it( 'should only dispatch a receive after all pending updates have finished', function( done ) {
			PreferencesActions.set( 'one', 1 );
			PreferencesActions.set( 'one', null );

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
			PreferencesActions.set( 'one', 1 );
			PreferencesActions.remove( 'one' );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, {} );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: { one: 1 }
				}
			} );
			expect( postSettings ).to.have.been.calledWithMatch( JSON.stringify( {
				[ USER_SETTING_KEY ]: { one: 1 }
			} ) );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_ME_SETTINGS'
				} );

				done();
			} );
		} );
	} );
} );
