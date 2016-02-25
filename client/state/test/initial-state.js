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
					serverState = { currentUser: { id: 123456789 } };
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
					expect( state.currentUser.id ).to.equal( 123456789 );
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
						currentUser: { id: 123456789 },
						users: {
							items: {
								123456789: {
									ID: 123456789,
									username: 'testuser'
								},
								111111111: {
									ID: 111111111,
									username: 'testuser2'
								}
							}
						},
						_timestamp: Date.now()
					},
					serverState = {
						users: {
							items: {
								123456789: {
									ID: 123456789,
									username: 'updatedtestuser'
								}
							}
						}
					};
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
					expect( state.users ).to.equal( serverState.users );
				} );
			} );
			describe( 'with stale persisted data and initial server data', () => {
				var configStub,
					consoleSpy,
					localforageGetItemStub,
					state,
					savedState = {
						currentUser: { id: 123456789 },
						users: {
							items: {
								123456789: {
									ID: 123456789,
									username: 'testuser'
								},
								111111111: {
									ID: 111111111,
									username: 'testuser2'
								}
							}
						},
						_timestamp: Date.now() - MAX_AGE
					},
					serverState = {
						users: {
							items: {
								123456789: {
									ID: 123456789,
									username: 'updatedtestuser'
								}
							}
						}
					};
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
					expect( state.users ).to.equal( serverState.users );
				} );
				it( 'does not build using local forage state', () => {
					expect( state.currentUser.id ).to.equal( null );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
			} );
			describe( 'with recently persisted data and no initial server data', () => {
				var configStub,
					consoleSpy,
					localforageGetItemStub,
					state,
					savedState = {
						currentUser: { id: 123456789 },
						users: {
							items: {
								123456789: {
									ID: 123456789,
									username: 'testuser'
								},
								111111111: {
									ID: 111111111,
									username: 'testuser2'
								}
							}
						},
						_timestamp: Date.now()
					},
					serverState = {};
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
					expect( state.users ).to.equal( savedState.users );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
			} );
		} );
	} );
} );
