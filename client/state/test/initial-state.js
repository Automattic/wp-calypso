require( 'lib/react-test-env-setup' )();
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import localforage from 'localforage';
/**
 * Internal dependencies
 */
import config from 'config';
import createReduxStoreFromPersistedInitialState, { MAX_AGE } from 'state/initial-state';

describe( 'initial-state', () => {
	describe( 'createReduxStoreFromPersistedInitialState', () => {
		describe( 'persist-redux disabled', () => {
			describe( 'with recently persisted data and initial server data', () => {
				var configStub,
					consoleSpy,
					state,
					serverState = { ui: { section: 'hello' } };
				before( ( done ) => {
					window.initialReduxState = serverState;
					configStub = sinon.stub( config, 'isEnabled' );
					configStub.withArgs( 'persist-redux' ).returns( false );
					consoleSpy = sinon.spy( console, 'error' );
					const reduxReady = function( reduxStore ) {
						state = reduxStore.getState();
						done();
					};
					createReduxStoreFromPersistedInitialState( reduxReady );
				} );
				after( () => {
					window.initialReduxState = null;
					configStub.restore();
					consoleSpy.restore();
				} );
				it( 'builds store without errors', () => {
					expect( consoleSpy.called ).to.equal( false );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
				it( 'builds state using server state', () => {
					expect( state.ui.section ).to.equal( 'hello' );
				} );
			} );
		} );
		describe( 'persist-redux enabled', () => {
			describe( 'with recently persisted data and initial server data', () => {
				var configStub,
					consoleSpy,
					localforageGetItemStub,
					state,
					savedState = {
						ui: { section: 'bar', hasSidebar: true },
						currentUser: { id: 123456789 },
						_timestamp: Date.now()
					},
					serverState = { ui: { section: 'hello' } };
				before( ( done ) => {
					window.initialReduxState = serverState;
					configStub = sinon.stub( config, 'isEnabled' );
					configStub.withArgs( 'persist-redux' ).returns( true );
					consoleSpy = sinon.spy( console, 'error' );
					localforageGetItemStub = sinon.stub( localforage, 'getItem' )
						.returns(
						new Promise( function( resolve ) {
							resolve( savedState );
						} )
					);
					const reduxReady = function( reduxStore ) {
						state = reduxStore.getState();
						done();
					};
					createReduxStoreFromPersistedInitialState( reduxReady );
				} );
				after( () => {
					window.initialReduxState = null;
					configStub.restore();
					consoleSpy.restore();
					localforageGetItemStub.restore();
				} );
				it( 'builds store without errors', () => {
					expect( consoleSpy.called ).to.equal( false );
				} );
				it( 'builds state using local forage state', () => {
					expect( state.currentUser.id ).to.equal( 123456789 );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
				it( 'server state shallowly overrides local forage state', () => {
					expect( state.ui.section ).to.equal( 'hello' );
					expect( state.hasSidebar ).to.equal( undefined );
				} );
			} );
			describe( 'with stale persisted data and initial server data', () => {
				var configStub,
					consoleSpy,
					localforageGetItemStub,
					state,
					savedState = {
						ui: { section: 'bar', hasSidebar: true },
						currentUser: { id: 123456789 },
						_timestamp: Date.now() - MAX_AGE
					},
					serverState = { ui: { section: 'hello' } };
				before( ( done ) => {
					window.initialReduxState = serverState;
					configStub = sinon.stub( config, 'isEnabled' );
					configStub.withArgs( 'persist-redux' ).returns( true );
					consoleSpy = sinon.spy( console, 'error' );
					localforageGetItemStub = sinon.stub( localforage, 'getItem' )
						.returns(
						new Promise( function( resolve ) {
							resolve( savedState );
						} )
					);
					const reduxReady = function( reduxStore ) {
						state = reduxStore.getState();
						done();
					};
					createReduxStoreFromPersistedInitialState( reduxReady );
				} );
				after( () => {
					window.initialReduxState = null;
					configStub.restore();
					consoleSpy.restore();
					localforageGetItemStub.restore();
				} );
				it( 'builds store without errors', () => {
					expect( consoleSpy.called ).to.equal( false );
				} );
				it( 'builds using server state', () => {
					expect( state.ui.section ).to.equal( 'hello' );
					expect( state.hasSidebar ).to.equal( undefined );
				} );
				it( 'does not build using local forage state', () => {
					expect( state.currentUser.id ).to.equal( null );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
			} );
		} );
	} );
} );
