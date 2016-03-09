/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'initial-state', () => {
	let localforage, createReduxStoreFromPersistedInitialState, MAX_AGE,
		isSwitchedUser = false,
		isReduxEnabled = false,
		isEnabled = () => isReduxEnabled,
		isSupportUserSession = () => isSwitchedUser;

	useFakeDom();

	useMockery( () => {
		const configMock = function() {
			return 'development'; //needed to mock out lib/warn
		};
		configMock.isEnabled = isEnabled;
		mockery.registerMock( 'lib/user/support-user-interop', { isSupportUserSession: isSupportUserSession } );
		mockery.registerMock( 'config', configMock );
		localforage = require( 'localforage' );
		const initialState = require( 'state/initial-state' );
		createReduxStoreFromPersistedInitialState = initialState.default;
		MAX_AGE = initialState.MAX_AGE;
	}, null );

	describe( 'createReduxStoreFromPersistedInitialState', () => {
		describe( 'persist-redux disabled', () => {
			describe( 'with recently persisted data and initial server data', () => {
				var state,
					serverState = { currentUser: { id: 123456789 } };
				before( ( done ) => {
					window.initialReduxState = serverState;
					sinon.spy( console, 'error' );
					const reduxReady = function( reduxStore ) {
						state = reduxStore.getState();
						done();
					};
					createReduxStoreFromPersistedInitialState( reduxReady );
				} );
				after( () => {
					console.error.restore();
					window.initialReduxState = null;
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false );
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
			describe( 'switched user', () => {
				describe( 'with recently persisted data and initial server data', () => {
					var state,
						savedState = {
							postTypes: {
								items: {
									2916284: {
										post: { name: 'post', label: 'Posts' },
										page: { name: 'page', label: 'Pages' }
									}
								}
							},
							_timestamp: Date.now()
						};
					before( ( done ) => {
						isReduxEnabled = true;
						isSwitchedUser = true;
						window.initialReduxState = { currentUser: { id: 123456789 } };
						sinon.spy( console, 'error' );
						sinon.stub( localforage, 'getItem' )
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
						isReduxEnabled = false;
						isSwitchedUser = false;
						window.initialReduxState = null;
						console.error.restore();
						localforage.getItem.restore();
					} );
					it( 'builds store without errors', () => {
						expect( console.error.called ).to.equal( false );
					} );
					it( 'does not build using local forage state', () => {
						expect( state.postTypes.items[ 2916284 ] ).to.equal( undefined );
					} );
					it( 'does not add timestamp to store', () => {
						expect( state._timestamp ).to.equal( undefined );
					} );
					it( 'does not build state using server state', () => {
						expect( state.currentUser.id ).to.equal( null );
					} );
				} );
			} );
			describe( 'with recently persisted data and initial server data', () => {
				var state,
					savedState = {
						currentUser: { id: 123456789 },
						postTypes: {
							items: {
								2916284: {
									post: { name: 'post', label: 'Posts' },
									page: { name: 'page', label: 'Pages' }
								}
							}
						},
						_timestamp: Date.now()
					},
					serverState = {
						postTypes: {
							items: {
								77203074: {
									post: { name: 'post', label: 'Posts' }
								}
							}
						}
					};
				before( ( done ) => {
					window.initialReduxState = serverState;
					isReduxEnabled = true;
					sinon.spy( console, 'error' );
					sinon.stub( localforage, 'getItem' )
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
					isReduxEnabled = false;
					console.error.restore();
					localforage.getItem.restore();
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false );
				} );
				it( 'builds state using local forage state', () => {
					expect( state.currentUser.id ).to.equal( 123456789 );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
				it( 'server state shallowly overrides local forage state', () => {
					expect( state.postTypes.items ).to.equal( serverState.postTypes.items );
				} );
			} );
			describe( 'with stale persisted data and initial server data', () => {
				var state,
					serverState = {
						postTypes: {
							items: {
								77203074: {
									post: { name: 'post', label: 'Posts' }
								}
							}
						}
					};
				before( ( done ) => {
					window.initialReduxState = serverState;
					isReduxEnabled = true;
					sinon.spy( console, 'error' );
					sinon.stub( localforage, 'getItem' )
						.returns(
						new Promise( function( resolve ) {
							resolve( {
								currentUser: { id: 123456789 },
								postTypes: {
									items: {
										2916284: {
											post: { name: 'post', label: 'Posts' },
											page: { name: 'page', label: 'Pages' }
										}
									}
								},
								_timestamp: Date.now() - MAX_AGE - 1
							} );
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
					isReduxEnabled = false;
					console.error.restore();
					localforage.getItem.restore();
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false );
				} );
				it( 'builds using server state', () => {
					expect( state.postTypes.items ).to.equal( serverState.postTypes.items );
				} );
				it( 'does not build using local forage state', () => {
					expect( state.currentUser.id ).to.equal( null );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
			} );
			describe( 'with recently persisted data and no initial server data', () => {
				var state,
					savedState = {
						currentUser: { id: 123456789 },
						postTypes: {
							items: {
								2916284: {
									post: { name: 'post', label: 'Posts' },
									page: { name: 'page', label: 'Pages' }
								}
							}
						},
						_timestamp: Date.now()
					},
					serverState = {};
				before( ( done ) => {
					window.initialReduxState = serverState;
					isReduxEnabled = true;
					sinon.spy( console, 'error' );
					sinon.stub( localforage, 'getItem' )
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
					isReduxEnabled = false;
					console.error.restore();
					localforage.getItem.restore();
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false );
				} );
				it( 'builds state using local forage state', () => {
					expect( state.currentUser.id ).to.equal( 123456789 );
					expect( state.postTypes.items ).to.equal( savedState.postTypes.items );
				} );
				it( 'does not add timestamp to store', () => {
					expect( state._timestamp ).to.equal( undefined );
				} );
			} );
		} );
	} );
} );
