/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { createStore } from 'redux';
import { useFakeTimers } from 'sinon';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import localforage from 'lib/localforage';
import userFactory from 'lib/user';
import { isSupportUserSession } from 'lib/user/support-user-interop';
import createReduxStoreFromPersistedInitialState, {
	persistOnChange,
	MAX_AGE,
	SERIALIZE_THROTTLE,
} from 'state/initial-state';

jest.mock( 'config', () => {
	const config = () => 'development';

	config.isEnabled = jest.fn().mockReturnValue( false );

	return config;
} );
jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
jest.mock( 'lib/user', () => () => ( {
	get: () => ( {
		ID: 123456789,
	} ),
} ) );
jest.mock( 'lib/user/support-user-interop', () => ( {
	isSupportUserSession: jest.fn().mockReturnValue( false ),
} ) );

describe( 'initial-state', () => {
	describe( 'createReduxStoreFromPersistedInitialState', () => {
		describe( 'persist-redux disabled', () => {
			describe( 'with recently persisted data and initial server data', () => {
				let state, consoleErrorSpy, getItemSpy;

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

				const serverState = { currentUser: { id: 123456789 } };

				beforeAll( done => {
					window.initialReduxState = serverState;
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					createReduxStoreFromPersistedInitialState( reduxStore => {
						state = reduxStore.getState();
						done();
					} );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
				} );

				test( 'builds store without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'does not build using local forage state', () => {
					expect( state.postTypes.items[ 2916284 ] ).toBeUndefined();
				} );

				test( 'does not add timestamp to store', () => {
					expect( state._timestamp ).toBeUndefined();
				} );

				test( 'builds state using server state', () => {
					expect( state.currentUser.id ).toBe( 123456789 );
				} );
			} );
		} );

		describe( 'persist-redux enabled', () => {
			describe( 'switched user', () => {
				describe( 'with recently persisted data and initial server data', () => {
					let state, consoleErrorSpy, getItemSpy;

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
						consoleErrorSpy = jest.spyOn( global.console, 'error' );
						getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
						createReduxStoreFromPersistedInitialState( reduxStore => {
							state = reduxStore.getState();
							done();
						} );
					} );

					afterAll( () => {
						isEnabled.mockReturnValue( false );
						isSupportUserSession.mockReturnValue( false );
						window.initialReduxState = null;
						consoleErrorSpy.mockRestore();
						getItemSpy.mockRestore();
					} );

					test( 'builds store without errors', () => {
						expect( consoleErrorSpy ).not.toHaveBeenCalled();
					} );

					test( 'does not build using local forage state', () => {
						expect( state.postTypes.items[ 2916284 ] ).toBeUndefined();
					} );

					test( 'does not add timestamp to store', () => {
						expect( state._timestamp ).toBeUndefined();
					} );

					test( 'does not build state using server state', () => {
						expect( state.currentUser.currencyCode ).toBeNull();
					} );
				} );
			} );

			describe( 'with recently persisted data and initial server data', () => {
				let state, consoleErrorSpy, getItemSpy;

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
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					createReduxStoreFromPersistedInitialState( reduxStore => {
						state = reduxStore.getState();
						done();
					} );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
				} );

				test( 'builds store without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds state using local forage state', () => {
					expect( state.currentUser.id ).toBe( 123456789 );
				} );

				test( 'does not add timestamp to store', () => {
					expect( state._timestamp ).toBeUndefined();
				} );

				test( 'server state shallowly overrides local forage state', () => {
					expect( state.postTypes.items ).toEqual( serverState.postTypes.items );
				} );
			} );

			describe( 'with stale persisted data and initial server data', () => {
				let state, consoleErrorSpy, getItemSpy;

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
					_timestamp: Date.now() - MAX_AGE - 1,
				};

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
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					createReduxStoreFromPersistedInitialState( reduxStore => {
						state = reduxStore.getState();
						done();
					} );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
				} );

				test( 'builds store without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds using server state', () => {
					expect( state.postTypes.items ).toEqual( serverState.postTypes.items );
				} );

				test( 'does not build using local forage state', () => {
					expect( state.currentUser.id ).toBeNull();
				} );

				test( 'does not add timestamp to store', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );

			describe( 'with recently persisted data and no initial server data', () => {
				let state, consoleErrorSpy, getItemSpy;

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

				const serverState = {};

				beforeAll( done => {
					window.initialReduxState = serverState;
					isEnabled.mockReturnValue( true );
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					createReduxStoreFromPersistedInitialState( reduxStore => {
						state = reduxStore.getState();
						done();
					} );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
				} );

				test( 'builds store without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds state using local forage state', () => {
					expect( state.currentUser.id ).toBe( 123456789 );
					expect( state.postTypes.items ).toEqual( savedState.postTypes.items );
				} );

				test( 'does not add timestamp to store', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );

			describe( 'with invalid persisted data and no initial server data', () => {
				let state, consoleErrorSpy, getItemSpy;

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
				};

				const serverState = {};

				beforeAll( done => {
					window.initialReduxState = serverState;
					isEnabled.mockReturnValue( true );
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					createReduxStoreFromPersistedInitialState( reduxStore => {
						state = reduxStore.getState();
						done();
					} );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.mockReturnValue( false );
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
				} );

				test( 'builds store without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'does not build using local forage state', () => {
					expect( state.postTypes.items[ 2916284 ] ).toBeUndefined();
				} );

				test( 'does not add timestamp to store', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );
		} );
	} );

	describe( '#persistOnChange()', () => {
		let store, clock, setItemSpy;

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
			// we use fake timers from Sinon (aka Lolex) because `lodash.throttle` also uses `Date.now()`
			// and relies on it returning a mocked value. Jest fake timers don't mock `Date`, Lolex does.
			clock = useFakeTimers();
			setItemSpy = jest
				.spyOn( localforage, 'setItem' )
				.mockImplementation( value => Promise.resolve( value ) );

			store = persistOnChange( createStore( reducer, initialState ), state => state );
		} );

		afterEach( () => {
			clock.restore();
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
			expect( setItemSpy ).toHaveBeenCalledWith( 'redux-state-123456789', {
				...initialState,
				data: 3,
			} );
			expect( setItemSpy ).toHaveBeenCalledWith( 'redux-state-123456789', {
				...initialState,
				data: 5,
			} );
		} );
	} );
} );
