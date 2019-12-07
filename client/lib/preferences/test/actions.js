/**
 * External dependencies
 */
import { expect } from 'chai';
import store from 'store';

/**
 * Internal dependencies
 */
import * as PreferencesActions from '../actions';
import { USER_SETTING_KEY, LOCALSTORAGE_KEY } from '../constants';
import Dispatcher from 'dispatcher';
import { getSettings, postSettings } from 'lib/wp';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
jest.mock( 'lib/user/utils', () => ( {
	isLoggedIn: () => true,
} ) );
jest.mock( 'store', () => ( {
	get: () => {},
	set: () => {},
} ) );
jest.mock( 'dispatcher', () => ( {
	handleViewAction: () => {},
	handleServerAction: () => {},
} ) );
jest.mock( 'lib/wp', () => {
	const { stub } = require( 'sinon' );
	const getSettings = stub();
	const postSettings = stub();

	return {
		getSettings,
		postSettings,
		undocumented: () => ( {
			me: () => ( {
				settings: () => ( {
					get: getSettings,
					update: postSettings,
				} ),
			} ),
		} ),
	};
} );

/**
 * Constants
 */
const DUMMY_PERSISTED_PREFERENCES = { saved: true };

describe( 'PreferencesActions', () => {
	let sandbox;
	useSandbox( _sandbox => ( sandbox = _sandbox ) );
	useNock();

	beforeEach( () => {
		sandbox.restore();
		sandbox.stub( store, 'get' );
		sandbox.stub( store, 'set' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( Dispatcher, 'handleServerAction' );

		getSettings.callsArgWithAsync( 0, null, {
			[ USER_SETTING_KEY ]: DUMMY_PERSISTED_PREFERENCES,
		} );
		postSettings.callsArgAsync( 1 );
	} );

	afterEach( () => {
		getSettings.resetHistory();
		postSettings.resetHistory();
	} );

	describe( '#fetch()', () => {
		test( 'should retrieve from localStorage and trigger a request to the REST API', done => {
			store.get.restore();
			sandbox.stub( store, 'get' ).returns( DUMMY_PERSISTED_PREFERENCES );

			PreferencesActions.fetch();

			expect( store.get ).to.have.been.calledWith( LOCALSTORAGE_KEY );
			expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: DUMMY_PERSISTED_PREFERENCES,
				},
			} );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledTwice;
				expect( store.set ).to.have.been.calledWith(
					LOCALSTORAGE_KEY,
					DUMMY_PERSISTED_PREFERENCES
				);
				done();
			} );
		} );

		test( 'should not persist to localStorage from remote request if error occurs', done => {
			sandbox.stub( PreferencesActions, 'mergePreferencesToLocalStorage' );

			getSettings.callsArgWithAsync( 0, true );

			PreferencesActions.fetch();
			process.nextTick( function() {
				expect( PreferencesActions.mergePreferencesToLocalStorage ).to.not.have.been.called;
				done();
			} );
		} );

		test( 'should not dispatch an empty local store', done => {
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

	describe( '#set()', () => {
		test( 'should save to localStorage and trigger a request to the REST API', done => {
			PreferencesActions.set( 'one', 1 );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, { one: 1 } );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS',
			} );
			expect( postSettings ).to.have.been.calledWithMatch(
				JSON.stringify( {
					[ USER_SETTING_KEY ]: { one: 1 },
				} )
			);

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_ME_SETTINGS',
				} );
				done();
			} );
		} );

		test( 'should add to, not replace, existing values', () => {
			store.get.restore();
			sandbox.stub( store, 'get' ).returns( { one: 1 } );
			PreferencesActions.set( 'two', 2 );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, { one: 1, two: 2 } );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: { two: 2 },
				},
			} );
		} );

		test( 'should assume a null value is to be removed', () => {
			PreferencesActions.set( 'one', 1 );
			PreferencesActions.set( 'one', null );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, { one: 1 } );
			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, {} );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: { one: null },
				},
			} );
		} );

		test( 'should only dispatch a receive after all pending updates have finished', done => {
			PreferencesActions.set( 'one', 1 );
			PreferencesActions.set( 'one', null );

			process.nextTick( function() {
				expect( postSettings ).to.have.been.calledTwice;
				expect( Dispatcher.handleServerAction ).to.have.been.calledOnce;
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_ME_SETTINGS',
				} );
				done();
			} );
		} );
	} );

	describe( '#remove()', () => {
		test( 'should remove from localStorage and trigger a request to the REST API', done => {
			PreferencesActions.set( 'one', 1 );
			PreferencesActions.remove( 'one' );

			expect( store.set ).to.have.been.calledWith( LOCALSTORAGE_KEY, {} );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'UPDATE_ME_SETTINGS',
				data: {
					[ USER_SETTING_KEY ]: { one: 1 },
				},
			} );
			expect( postSettings ).to.have.been.calledWithMatch(
				JSON.stringify( {
					[ USER_SETTING_KEY ]: { one: 1 },
				} )
			);

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_ME_SETTINGS',
				} );

				done();
			} );
		} );
	} );
} );
