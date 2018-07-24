/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect as chaiExpect } from 'chai';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import localforage from 'lib/localforage';
import userFactory from 'lib/user';
import { isSupportUserSession } from 'lib/user/support-user-interop';
import { useSandbox, useFakeTimers } from 'test/helpers/use-sinon';

jest.mock( 'config', () => {
	const config = () => 'development';

	config.isEnabled = jest.fn( false );

	return config;
} );
jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
jest.mock( 'lib/user', () => () => ( {
	get: () => ( {
		ID: 123456789,
	} ),
} ) );
jest.mock( 'lib/user/support-user-interop', () => ( {
	isSupportUserSession: jest.fn( false ),
} ) );

describe( 'initial-state', () => {
	let clock,
		createReduxStoreFromPersistedInitialState,
		persistOnChange,
		MAX_AGE,
		SERIALIZE_THROTTLE;

	useFakeTimers( fakeClock => {
		clock = fakeClock;
	} );

	beforeAll( () => {
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

				useSandbox( _sandbox => ( sandbox = _sandbox ) );

				beforeAll( done => {
					window.initialReduxState = serverState;
					sandbox.spy( console, 'error' );
					const reduxReady = function( reduxStore ) {
						state = reduxStore.getState();
						done();
					};
					createReduxStoreFromPersistedInitialState( reduxReady );
				} );
				afterAll( () => {
					window.initialReduxState = null;
				} );
				test( 'builds store without errors', () => {
					chaiExpect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
				} );
				test( 'does not add timestamp to store', () => {
					chaiExpect( state._timestamp ).to.equal( undefined );
				} );
				test( 'builds state using server state', () => {
					chaiExpect( state.currentUser.id ).to.equal( 123456789 );
				} );
			} );
		} );
		describe( 'persist-redux enabled', () => {
			describe( 'switched user', () => {
				describe( 'with recently persisted data and initial server data', () => {
					let state, sandbox;
					useSandbox( _sandbox => ( sandbox = _sandbox ) );
					const savedState = {
						currentUser: { id: 123456789 },
						postTypes: {
							items: {
								2916284: {
									post: { name: 'post', label: 'Posts' },
									page: { name: 'page', label: 'Pages' },
								},
							},
						},
						_timestamp: Date.now(),
					};
					beforeAll( done => {
						isEnabled.mockReturnValue( true );
						isSupportUserSession.mockReturnValue( true );
						window.initialReduxState = { currentUser: { currencyCode: 'USD' } };
						sandbox.spy( console, 'error' );
						sandbox.stub( localforage, 'getItem' ).returns(
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
					afterAll( () => {
						isEnabled.mockReturnValue( false );
						isSupportUserSession.mockReturnValue( false );
						window.initialReduxState = null;
					} );
					test( 'builds store without errors', () => {
						chaiExpect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
					} );
					test( 'does not build using local forage state', () => {
						chaiExpect( state.postTypes.items[ 2916284 ] ).to.equal( undefined );
					} );
					test( 'does not add timestamp to store', () => {
						chaiExpect( state._timestamp ).to.equal( undefined );
					} );
					test( 'does not build state using server state', () => {
						chaiExpect( state.currentUser.currencyCode ).to.equal( null );
					} );
				} );
			} );
			describe( 'with recently persisted data and initial server data', () => {
				let state, sandbox;
				useSandbox( _sandbox => ( sandbox = _sandbox ) );

				const savedState = {
						currentUser: { id: 123456789 },
						postTypes: {
							items: {
								2916284: {
									post: { name: 'post', label: 'Posts' },
									page: { name: 'page', label: 'Pages' },
								},
							},
						},
						_timestamp: Date.now(),
					},
					serverState = {
						postTypes: {
							items: {
								77203074: {
									post: { name: 'post', label: 'Posts' },
								},
							},
						},
					};
				beforeAll( done => {
					window.initialReduxState = serverState;
					isEnabled.mockReturnValue( true );
					sandbox.spy( console, 'error' );
					sandbox.stub( localforage, 'getItem' ).returns(
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
				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
				} );
				test( 'builds store without errors', () => {
					chaiExpect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
				} );
				test( 'builds state using local forage state', () => {
					chaiExpect( state.currentUser.id ).to.equal( 123456789 );
				} );
				test( 'does not add timestamp to store', () => {
					chaiExpect( state._timestamp ).to.equal( undefined );
				} );
				test( 'server state shallowly overrides local forage state', () => {
					chaiExpect( state.postTypes.items ).to.eql( serverState.postTypes.items );
				} );
			} );
			describe( 'with stale persisted data and initial server data', () => {
				let state, sandbox;
				useSandbox( _sandbox => ( sandbox = _sandbox ) );

				const serverState = {
					postTypes: {
						items: {
							77203074: {
								post: { name: 'post', label: 'Posts' },
							},
						},
					},
				};
				beforeAll( done => {
					window.initialReduxState = serverState;
					isEnabled.mockReturnValue( true );
					sandbox.spy( console, 'error' );
					sandbox.stub( localforage, 'getItem' ).returns(
						new Promise( function( resolve ) {
							resolve( {
								currentUser: { id: 123456789 },
								postTypes: {
									items: {
										2916284: {
											post: { name: 'post', label: 'Posts' },
											page: { name: 'page', label: 'Pages' },
										},
									},
								},
								_timestamp: Date.now() - MAX_AGE - 1,
							} );
						} )
					);
					const reduxReady = function( reduxStore ) {
						state = reduxStore.getState();
						done();
					};
					createReduxStoreFromPersistedInitialState( reduxReady );
				} );
				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
				} );
				test( 'builds store without errors', () => {
					chaiExpect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
				} );
				test( 'builds using server state', () => {
					chaiExpect( state.postTypes.items ).to.eql( serverState.postTypes.items );
				} );
				test( 'does not build using local forage state', () => {
					chaiExpect( state.currentUser.id ).to.equal( null );
				} );
				test( 'does not add timestamp to store', () => {
					chaiExpect( state._timestamp ).to.equal( undefined );
				} );
			} );
			describe( 'with recently persisted data and no initial server data', () => {
				let state, sandbox;
				useSandbox( _sandbox => ( sandbox = _sandbox ) );

				const savedState = {
						currentUser: { id: 123456789 },
						postTypes: {
							items: {
								2916284: {
									post: { name: 'post', label: 'Posts' },
									page: { name: 'page', label: 'Pages' },
								},
							},
						},
						_timestamp: Date.now(),
					},
					serverState = {};
				beforeAll( done => {
					window.initialReduxState = serverState;
					isEnabled.mockReturnValue( true );
					sandbox.spy( console, 'error' );
					sandbox.stub( localforage, 'getItem' ).returns(
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
				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
				} );
				test( 'builds store without errors', () => {
					chaiExpect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
				} );
				test( 'builds state using local forage state', () => {
					chaiExpect( state.currentUser.id ).to.equal( 123456789 );
					chaiExpect( state.postTypes.items ).to.eql( savedState.postTypes.items );
				} );
				test( 'does not add timestamp to store', () => {
					chaiExpect( state._timestamp ).to.equal( undefined );
				} );
			} );
			describe( 'with invalid persisted data and no initial server data', () => {
				let state, sandbox;
				useSandbox( _sandbox => ( sandbox = _sandbox ) );

				const savedState = {
						// Create an invalid state by forcing the user ID
						// stored in the state to differ from the current
						// mocked user ID.
						currentUser: { id: userFactory().get().ID + 1 },
						postTypes: {
							items: {
								2916284: {
									post: { name: 'post', label: 'Posts' },
									page: { name: 'page', label: 'Pages' },
								},
							},
						},
						_timestamp: Date.now(),
					},
					serverState = {};
				beforeAll( done => {
					window.initialReduxState = serverState;
					isEnabled.mockReturnValue( true );
					sandbox.spy( console, 'error' );
					sandbox.stub( localforage, 'getItem' ).returns(
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
				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
				} );
				test( 'builds store without errors', () => {
					chaiExpect( console.error.called ).to.equal( false ); // eslint-disable-line no-console
				} );
				test( 'does not build using local forage state', () => {
					chaiExpect( state.postTypes.items[ 2916284 ] ).to.equal( undefined );
				} );
				test( 'does not add timestamp to store', () => {
					chaiExpect( state._timestamp ).to.equal( undefined );
				} );
			} );
		} );
	} );

	describe( '#persistOnChange()', () => {
		let store, setItemSpy;

		const reducer = ( state, { data: newData, userId: userId } ) => {
			if ( newData && newData !== state.data ) {
				state = Object.assign( {}, state, { data: newData } );
			}
			if ( userId && userId !== state.currentUser.id ) {
				state = Object.assign( {}, state, { currentUser: { id: userId } } );
			}
			return state;
		};

		// Create a valid initial state (with a stored user ID that matches the
		// current mocked user ID).
		const initialState = { currentUser: { id: 123456789 } };

		beforeEach( () => {
			setItemSpy = jest
				.spyOn( localforage, 'setItem' )
				.mockImplementation( () => Promise.resolve() );

			store = persistOnChange( createStore( reducer, initialState ), state => state );
		} );

		afterEach( () => {
			setItemSpy.mockReset();
			setItemSpy.mockRestore();
		} );

		test( 'should persist state for first dispatch', () => {
			store.dispatch( {
				type: 'foo',
				data: 1,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( setItemSpy ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should not persist invalid state', () => {
			// Create an invalid state by forcing the user ID stored in the
			// state to differ from the current mocked user ID.
			store.dispatch( {
				type: 'foo',
				data: 1,
				userId: userFactory().get().ID + 1,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( setItemSpy ).toHaveBeenCalledTimes( 0 );
		} );

		test( 'should persist state for changed state', () => {
			store.dispatch( {
				type: 'foo',
				data: 1,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			store.dispatch( {
				type: 'foo',
				data: 2,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( setItemSpy ).toHaveBeenCalledTimes( 2 );
		} );

		test( 'should not persist state for unchanged state', () => {
			store.dispatch( {
				type: 'foo',
				data: 1,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			store.dispatch( {
				type: 'foo',
				data: 1,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( setItemSpy ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should throttle', () => {
			store.dispatch( {
				type: 'foo',
				data: 1,
			} );

			store.dispatch( {
				type: 'foo',
				data: 2,
			} );

			store.dispatch( {
				type: 'foo',
				data: 3,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			store.dispatch( {
				type: 'foo',
				data: 4,
			} );

			store.dispatch( {
				type: 'foo',
				data: 5,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( setItemSpy ).toHaveBeenCalledTimes( 2 );
			expect( setItemSpy ).toHaveBeenCalledWith(
				'redux-state-123456789',
				Object.assign( {}, initialState, { data: 3 } )
			);
			expect( setItemSpy ).toHaveBeenCalledWith(
				'redux-state-123456789',
				Object.assign( {}, initialState, { data: 5 } )
			);
		} );
	} );
} );
