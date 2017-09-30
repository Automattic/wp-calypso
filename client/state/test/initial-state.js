/** @jest-environment jsdom */
jest.mock( 'config', () => {
	const config = () => 'development';

	config.isEnabled = jest.fn( false );

	return config;
} );
jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
jest.mock( 'lib/user', () => () => ( {
	get: () => ( {
		ID: 123456789
	} )
} ) );
jest.mock( 'lib/user/support-user-interop', () => ( {
	isSupportUserSession: jest.fn( false )
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { isSupportUserSession } from 'lib/user/support-user-interop';
import localforage from 'lib/localforage';
import { useSandbox } from 'test/helpers/use-sinon';
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( 'initial-state', () => {
	let clock,
		createReduxStoreFromPersistedInitialState,
		persistOnChange,
		MAX_AGE,
		SERIALIZE_THROTTLE;

	useFakeTimers( fakeClock => {
		clock = fakeClock;
	} );

	before( () => {
		const initialState = require( 'state/initial-state' );
		createReduxStoreFromPersistedInitialState = initialState.default;
		persistOnChange = initialState.persistOnChange;
		MAX_AGE = initialState.MAX_AGE;
		SERIALIZE_THROTTLE = initialState.SERIALIZE_THROTTLE;
	} );

	describe( 'createReduxStoreFromPersistedInitialState', () => {
		describe( 'persist-redux disabled', () => {
			describe( 'with recently persisted data and initial server data', () => {
				let state, sandbox;
				const serverState = { currentUser: { id: 123456789 } };

				useSandbox( ( _sandbox ) => sandbox = _sandbox );

				before( ( done ) => {
					window.initialReduxState = serverState;
					sandbox.spy( console, 'error' );
					const reduxReady = function( reduxStore ) {
						state = reduxStore.getState();
						done();
					};
					createReduxStoreFromPersistedInitialState( reduxReady );
				} );
				after( () => {
					window.initialReduxState = null;
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
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
					let state, sandbox;
					useSandbox( ( _sandbox ) => sandbox = _sandbox );
					const savedState = {
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
						isEnabled.mockReturnValue( true );
						isSupportUserSession.mockReturnValue( true );
						window.initialReduxState = { currentUser: { id: 123456789 } };
						sandbox.spy( console, 'error' );
						sandbox.stub( localforage, 'getItem' )
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
						isEnabled.mockReturnValue( false );
						isSupportUserSession.mockReturnValue( false );
						window.initialReduxState = null;
					} );
					it( 'builds store without errors', () => {
						expect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
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
				let state, sandbox;
				useSandbox( ( _sandbox ) => sandbox = _sandbox );

				const savedState = {
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
					isEnabled.mockReturnValue( true );
					sandbox.spy( console, 'error' );
					sandbox.stub( localforage, 'getItem' )
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
					isEnabled.mockReturnValue( false );
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
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
				let state, sandbox;
				useSandbox( ( _sandbox ) => sandbox = _sandbox );

				const serverState = {
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
					isEnabled.mockReturnValue( true );
					sandbox.spy( console, 'error' );
					sandbox.stub( localforage, 'getItem' )
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
					isEnabled.mockReturnValue( false );
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
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
				let state, sandbox;
				useSandbox( ( _sandbox ) => sandbox = _sandbox );

				const savedState = {
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
					isEnabled.mockReturnValue( true );
					sandbox.spy( console, 'error' );
					sandbox.stub( localforage, 'getItem' )
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
					isEnabled.mockReturnValue( false );
				} );
				it( 'builds store without errors', () => {
					expect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
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

	describe( '#persistOnChange()', () => {
		let sandbox, store;

		useSandbox( ( _sandbox ) => sandbox = _sandbox );

		before( () => {
			sandbox.stub( localforage, 'setItem' ).returns( Promise.resolve() );
		} );

		beforeEach( () => {
			sandbox.reset();

			store = persistOnChange(
				createStore( ( state, { data: nextState } ) => nextState ),
				( state ) => state
			);
		} );

		it( 'should persist state for first dispatch', () => {
			store.dispatch( {
				type: 'foo',
				data: 1
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( localforage.setItem ).to.have.been.calledOnce;
		} );

		it( 'should persist state for changed state', () => {
			store.dispatch( {
				type: 'foo',
				data: 1
			} );

			clock.tick( SERIALIZE_THROTTLE );

			store.dispatch( {
				type: 'foo',
				data: 2
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( localforage.setItem ).to.have.been.calledTwice;
		} );

		it( 'should not persist state for unchanged state', () => {
			store.dispatch( {
				type: 'foo',
				data: 1
			} );

			clock.tick( SERIALIZE_THROTTLE );

			store.dispatch( {
				type: 'foo',
				data: 1
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( localforage.setItem ).to.have.been.calledOnce;
		} );

		it( 'should throttle', () => {
			store.dispatch( {
				type: 'foo',
				data: 1
			} );

			store.dispatch( {
				type: 'foo',
				data: 2
			} );

			store.dispatch( {
				type: 'foo',
				data: 3
			} );

			clock.tick( SERIALIZE_THROTTLE );

			store.dispatch( {
				type: 'foo',
				data: 4
			} );

			store.dispatch( {
				type: 'foo',
				data: 5
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( localforage.setItem ).to.have.been.calledTwice;
			expect( localforage.setItem ).to.have.been.calledWith( 'redux-state-123456789', 3 );
			expect( localforage.setItem ).to.have.been.calledWith( 'redux-state-123456789', 5 );
		} );
	} );
} );
