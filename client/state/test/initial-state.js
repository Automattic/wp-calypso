/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { mapKeys } from 'lodash';
import { useFakeTimers } from 'sinon';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import * as browserStorage from 'lib/browser-storage';
import userFactory from 'lib/user';
import { isSupportSession } from 'lib/user/support-user-interop';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import { createReduxStore } from 'state';
import initialReducer from 'state/reducer';
import signupReducer from 'state/signup/reducer';
import {
	getInitialState,
	persistOnChange,
	loadAllState,
	MAX_AGE,
	SERIALIZE_THROTTLE,
} from 'state/initial-state';
import { combineReducers, withStorageKey } from 'state/utils';
import { addReducerToStore } from 'state/add-reducer';

jest.mock( 'config', () => {
	let persistReduxEnabled = false;

	const config = () => 'development';

	config.isEnabled = jest.fn( ( key ) => key === 'persist-redux' && persistReduxEnabled );
	config.isEnabled.enablePersistRedux = () => ( persistReduxEnabled = true );
	config.isEnabled.disablePersistRedux = () => ( persistReduxEnabled = false );

	return config;
} );

jest.mock( 'lib/user', () => () => ( {
	get: () => ( {
		ID: 123456789,
	} ),
} ) );
jest.mock( 'lib/user/support-user-interop', () => ( {
	isSupportSession: jest.fn().mockReturnValue( false ),
} ) );

describe( 'initial-state', () => {
	describe( 'getInitialState', () => {
		describe( 'persist-redux disabled', () => {
			describe( 'with recently persisted data and initial server data', () => {
				let state, consoleErrorSpy, getStoredItemSpy;

				const savedState = {
					'redux-state-123456789': {
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
				};

				const serverState = { currentUser: { id: 123456789 } };

				beforeAll( async () => {
					window.initialReduxState = serverState;
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getStoredItemSpy = jest
						.spyOn( browserStorage, 'getAllStoredItems' )
						.mockResolvedValue( savedState );
					await loadAllState();
					state = getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					consoleErrorSpy.mockRestore();
					getStoredItemSpy.mockRestore();
				} );

				test( 'builds initial state without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'does not build initial state using IndexedDB state', () => {
					expect( state ).not.toHaveProperty( 'postTypes' );
				} );

				test( 'does not add timestamp to initial state', () => {
					expect( state._timestamp ).toBeUndefined();
				} );

				test( 'builds initial state using server state', () => {
					expect( state.currentUser.id ).toBe( 123456789 );
				} );
			} );
		} );

		describe( 'persist-redux enabled', () => {
			describe( 'switched user', () => {
				describe( 'with recently persisted data and initial server data', () => {
					let state, consoleErrorSpy, getStoredItemSpy;

					const savedState = {
						'redux-state-123456789': {
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
					};

					beforeAll( async () => {
						isEnabled.enablePersistRedux();
						isSupportSession.mockReturnValue( true );
						window.initialReduxState = { currentUser: { currencyCode: 'USD' } };
						consoleErrorSpy = jest.spyOn( global.console, 'error' );
						getStoredItemSpy = jest
							.spyOn( browserStorage, 'getAllStoredItems' )
							.mockResolvedValue( savedState );
						await loadAllState();
						state = getInitialState( initialReducer );
					} );

					afterAll( () => {
						isEnabled.disablePersistRedux();
						isSupportSession.mockReturnValue( false );
						window.initialReduxState = null;
						consoleErrorSpy.mockRestore();
						getStoredItemSpy.mockRestore();
					} );

					test( 'builds initial state without errors', () => {
						expect( consoleErrorSpy ).not.toHaveBeenCalled();
					} );

					test( 'does not build initial state using IndexedDB state', () => {
						expect( state.postTypes ).toBeUndefined();
					} );

					test( 'does not add timestamp to initial state', () => {
						expect( state._timestamp ).toBeUndefined();
					} );

					test( 'does not build initial state using server state', () => {
						expect( state.currentUser ).toBeUndefined();
					} );
				} );
			} );

			describe( 'with recently persisted data and initial server data', () => {
				let state, consoleErrorSpy, getStoredItemSpy;

				const savedState = {
					'redux-state-123456789': {
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

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getStoredItemSpy = jest
						.spyOn( browserStorage, 'getAllStoredItems' )
						.mockResolvedValue( savedState );
					await loadAllState();
					state = getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getStoredItemSpy.mockRestore();
				} );

				test( 'builds initial state without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds initial state using IndexedDB state', () => {
					expect( state.currentUser.id ).toBe( 123456789 );
				} );

				test( 'does not add timestamp to initial state', () => {
					expect( state._timestamp ).toBeUndefined();
				} );

				test( 'server state shallowly overrides IndexedDB state', () => {
					expect( state.postTypes.items ).toEqual( serverState.postTypes.items );
				} );
			} );

			describe( 'with stale persisted data and initial server data', () => {
				let state, consoleErrorSpy, getStoredItemSpy;

				const savedState = {
					'redux-state-123456789': {
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
					},
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

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getStoredItemSpy = jest
						.spyOn( browserStorage, 'getAllStoredItems' )
						.mockResolvedValue( savedState );
					await loadAllState();
					state = getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getStoredItemSpy.mockRestore();
				} );

				test( 'builds store without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds initial state using server state', () => {
					expect( state.postTypes.items ).toEqual( serverState.postTypes.items );
				} );

				test( 'does not build initial state using IndexedDB state', () => {
					expect( state.currentUser ).toBeUndefined();
				} );

				test( 'does not add timestamp to store', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );

			describe( 'with recently persisted data and no initial server data', () => {
				let state, consoleErrorSpy, getStoredItemSpy;

				const savedState = {
					'redux-state-123456789': {
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
				};

				const serverState = {};

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getStoredItemSpy = jest
						.spyOn( browserStorage, 'getAllStoredItems' )
						.mockResolvedValue( savedState );
					await loadAllState();
					state = getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getStoredItemSpy.mockRestore();
				} );

				test( 'builds initial state without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds state using local forage state', () => {
					expect( state.currentUser.id ).toBe( 123456789 );
					expect( state.postTypes.items ).toEqual(
						savedState[ 'redux-state-123456789' ].postTypes.items
					);
				} );

				test( 'does not add timestamp to store', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );

			describe( 'with invalid persisted data and no initial server data', () => {
				let state, consoleErrorSpy, getStoredItemSpy;

				const userId = userFactory().get().ID + 1;
				const savedState = {
					[ `redux-state-${ userId }` ]: {
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
				};

				const serverState = {};

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getStoredItemSpy = jest
						.spyOn( browserStorage, 'getAllStoredItems' )
						.mockResolvedValue( savedState );
					await loadAllState();
					state = getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getStoredItemSpy.mockRestore();
				} );

				test( 'builds initial state without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'does not build initial state using IndexedDB state', () => {
					expect( state.postTypes ).toBeUndefined();
				} );

				test( 'does not add timestamp to initial state', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );

			describe( 'with empty persisted signup state for logged in user, and persisted state for logged out user', () => {
				let state, consoleErrorSpy, getStoredItemSpy;

				const _timestamp = Date.now();
				const storedState = {
					'redux-state-logged-out:signup': {
						dependencyStore: {
							siteType: 'blog',
							siteTitle: 'Logged out test title',
						},
						progress: {
							'logged-out-step': {
								stepName: 'logged-out-step',
								status: 'completed',
							},
						},
						_timestamp,
					},
				};
				const serverState = {};

				beforeAll( async () => {
					isEnabled.enablePersistRedux();
					window.initialReduxState = serverState;
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getStoredItemSpy = jest
						.spyOn( browserStorage, 'getAllStoredItems' )
						.mockResolvedValue( storedState );

					await loadAllState();
					state = getInitialState( combineReducers( { signup: signupReducer } ) );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getStoredItemSpy.mockRestore();
				} );

				test( 'builds initial state without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds initial signup state from logged out state', () => {
					expect( state.signup.dependencyStore ).toEqual(
						storedState[ 'redux-state-logged-out:signup' ].dependencyStore
					);
					expect( state.signup.progress ).toEqual(
						storedState[ 'redux-state-logged-out:signup' ].progress
					);
				} );

				test( 'does not add timestamp to initial state', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );

			describe( 'with existing persisted signup state for logged in user, and persisted state for logged out user', () => {
				let state, consoleErrorSpy, getStoredItemSpy;

				const _timestamp = Date.now();
				const storedState = {
					'redux-state-123456789:signup': {
						dependencyStore: {
							siteType: 'blog',
							siteTitle: 'Logged in test title',
						},
						progress: {
							'logged-in-step': {
								stepName: 'logged-in-step',
								status: 'completed',
							},
						},
						_timestamp,
					},
					'redux-state-logged-out:signup': {
						dependencyStore: {
							siteType: 'blog',
							siteTitle: 'Logged out test title',
						},
						progress: {
							'logged-out-step': {
								stepName: 'logged-out-step',
								status: 'completed',
							},
						},
						_timestamp,
					},
				};
				const serverState = {};

				beforeAll( async () => {
					isEnabled.enablePersistRedux();
					window.initialReduxState = serverState;
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getStoredItemSpy = jest
						.spyOn( browserStorage, 'getAllStoredItems' )
						.mockResolvedValue( storedState );

					await loadAllState();
					state = getInitialState( combineReducers( { signup: signupReducer } ) );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getStoredItemSpy.mockRestore();
				} );

				test( 'builds initial state without errors', () => {
					expect( consoleErrorSpy ).not.toHaveBeenCalled();
				} );

				test( 'builds initial signup state from logged in state', () => {
					expect( state.signup.dependencyStore ).toEqual(
						storedState[ 'redux-state-123456789:signup' ].dependencyStore
					);
					expect( state.signup.progress ).toEqual(
						storedState[ 'redux-state-123456789:signup' ].progress
					);
				} );

				test( 'does not add timestamp to initial state', () => {
					expect( state._timestamp ).toBeUndefined();
				} );
			} );
		} );
	} );

	describe( '#persistOnChange()', () => {
		let store, clock, setStoredItemSpy;

		const dataReducer = ( state = null, { data } ) => {
			if ( data && data !== state ) {
				return data;
			}
			return state;
		};
		dataReducer.hasCustomPersistence = true;

		const currentUserReducer = ( state = null, { userId } ) => {
			if ( userId && userId !== state.id ) {
				return { ...state, id: userId };
			}
			return state;
		};
		currentUserReducer.hasCustomPersistence = true;

		const reducer = combineReducers( { data: dataReducer, currentUser: currentUserReducer } );

		// Create a valid initial state (with a stored user ID that matches the
		// current mocked user ID).
		const initialState = { currentUser: { id: 123456789 } };

		beforeEach( async () => {
			isEnabled.enablePersistRedux();
			// we use fake timers from Sinon (aka Lolex) because `lodash.throttle` also uses `Date.now()`
			// and relies on it returning a mocked value. Jest fake timers don't mock `Date`, Lolex does.
			clock = useFakeTimers();
			setStoredItemSpy = jest
				.spyOn( browserStorage, 'setStoredItem' )
				.mockImplementation( ( value ) => Promise.resolve( value ) );

			store = createReduxStore( initialState, reducer );
			persistOnChange( store, false );
		} );

		afterEach( () => {
			isEnabled.enablePersistRedux();
			clock.restore();
			setStoredItemSpy.mockRestore();
		} );

		test( 'should persist state for first dispatch', () => {
			store.dispatch( {
				type: 'foo',
				data: 1,
			} );

			clock.tick( SERIALIZE_THROTTLE );

			expect( setStoredItemSpy ).toHaveBeenCalledTimes( 1 );
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

			expect( setStoredItemSpy ).toHaveBeenCalledTimes( 0 );
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

			expect( setStoredItemSpy ).toHaveBeenCalledTimes( 2 );
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

			expect( setStoredItemSpy ).toHaveBeenCalledTimes( 1 );
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

			expect( setStoredItemSpy ).toHaveBeenCalledTimes( 2 );
			expect( setStoredItemSpy ).toHaveBeenCalledWith(
				'redux-state-123456789',
				expect.objectContaining( { data: 3 } )
			);
			expect( setStoredItemSpy ).toHaveBeenCalledWith(
				'redux-state-123456789',
				expect.objectContaining( { data: 5 } )
			);
		} );
	} );
} );

describe( 'loading stored state with dynamic reducers', () => {
	// Creates a reducer that serializes objects by prefixing all keys with a given prefix.
	// For example, `withKeyPrefix( 'A' )` serializes `{ x: 1, y: 2 }` into `{ 'A:x': 1, 'A:y': 2 }`
	const withKeyPrefix = ( keyPrefix ) => {
		const keyPrefixRe = new RegExp( `^${ keyPrefix }:` );
		const reducer = ( state = {}, action ) => {
			switch ( action.type ) {
				case DESERIALIZE:
					return mapKeys( state, ( value, key ) => key.replace( keyPrefixRe, '' ) );
				case SERIALIZE:
					return mapKeys( state, ( value, key ) => `${ keyPrefix }:${ key }` );
				default:
					return state;
			}
		};
		reducer.hasCustomPersistence = true;
		return reducer;
	};

	const currentUserReducer = ( state = { id: null } ) => state;
	currentUserReducer.hasCustomPersistence = true;

	let getStoredItemSpy;

	beforeEach( () => {
		isEnabled.enablePersistRedux();

		// state stored in IndexedDB
		const _timestamp = Date.now();
		const storedState = {
			'redux-state-123456789': {
				currentUser: { id: 123456789 },
				_timestamp,
			},
			'redux-state-123456789:A': {
				'A:city': 'London',
				'A:country': 'UK',
				_timestamp,
			},
			'redux-state-123456789:B': {
				'B:city': 'Paris',
				'B:country': 'France',
				_timestamp,
			},
			'redux-state-123456789:CD': {
				'CD:city': 'Lisbon',
				'CD:country': 'Portugal',
				_timestamp,
			},
			'redux-state-123456789:E': {
				'E:city': 'Madrid',
				'E:country': 'Spain',
				_timestamp,
			},
		};

		// `lib/browser-storage` mock to return mock IndexedDB state
		getStoredItemSpy = jest
			.spyOn( browserStorage, 'getAllStoredItems' )
			.mockResolvedValue( storedState );
	} );

	afterEach( () => {
		isEnabled.disablePersistRedux();
		getStoredItemSpy.mockRestore();
	} );

	test( 'loads state from multiple storage keys', async () => {
		// initial reducer. includes several subreducers with storageKey property
		const reducer = combineReducers( {
			currentUser: currentUserReducer,
			a: withStorageKey( 'A', withKeyPrefix( 'A' ) ),
			b: withStorageKey( 'B', withKeyPrefix( 'B' ) ),
		} );

		// load initial state and create Redux store with it
		await loadAllState();
		const state = getInitialState( reducer );
		const store = createReduxStore( state, reducer );

		// verify that state from all storageKey's was loaded
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
			a: {
				city: 'London',
				country: 'UK',
			},
			b: {
				city: 'Paris',
				country: 'France',
			},
		} );
	} );

	test( 'loads state after adding a reducer', async () => {
		// initial reducer. includes only the `currentUser` subreducer.
		const reducer = combineReducers( {
			currentUser: currentUserReducer,
		} );

		// load initial state and create Redux store with it
		await loadAllState();
		const state = getInitialState( reducer );
		const store = createReduxStore( state, reducer );

		// verify that the initial Redux store loaded state only for `currentUser`
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
		} );

		// load a reducer dynamically
		const aReducer = withStorageKey( 'A', withKeyPrefix( 'A' ) );
		addReducerToStore( store )( [ 'a' ], aReducer );

		// verify that the Redux store contains the stored state for `A` now
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
			a: {
				city: 'London',
				country: 'UK',
			},
		} );
	} );

	test( 'loads state after adding a nested reducer', async () => {
		// initial reducer. includes only the `currentUser` subreducer.
		const reducer = combineReducers( {
			currentUser: currentUserReducer,
		} );

		// load initial state and create Redux store with it
		await loadAllState();
		const state = getInitialState( reducer );
		const store = createReduxStore( state, reducer );

		// verify that the initial Redux store loaded state only for `currentUser`
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
		} );

		// load a reducer dynamically
		const cdReducer = withStorageKey( 'CD', withKeyPrefix( 'CD' ) );
		addReducerToStore( store )( [ 'c', 'd' ], cdReducer );

		// verify that the Redux store contains the stored state for `A` now
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
			c: {
				d: {
					city: 'Lisbon',
					country: 'Portugal',
				},
			},
		} );
	} );

	test( 'loads state a single time after adding a reducer twice', async () => {
		// initial reducer. includes only the `currentUser` subreducer.
		const reducer = combineReducers( {
			currentUser: currentUserReducer,
		} );

		// load initial state and create Redux store with it
		await loadAllState();
		const state = getInitialState( reducer );
		const store = createReduxStore( state, reducer );

		// verify that the initial Redux store loaded state only for `currentUser`
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
		} );

		// load a reducer dynamically
		const eReducer = withStorageKey( 'E', withKeyPrefix( 'E' ) );
		addReducerToStore( store )( [ 'e' ], eReducer );
		addReducerToStore( store )( [ 'e' ], eReducer );

		// verify that the Redux store contains the stored state for `E` now
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
			e: {
				city: 'Madrid',
				country: 'Spain',
			},
		} );
	} );

	test( 'throws an error when adding two different reducers to the same key', async () => {
		// initial reducer. includes only the `currentUser` subreducer.
		const reducer = combineReducers( {
			currentUser: currentUserReducer,
		} );

		// load initial state and create Redux store with it
		await loadAllState();
		const state = getInitialState( reducer );
		const store = createReduxStore( state, reducer );

		// verify that the initial Redux store loaded state only for `currentUser`
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
		} );

		// load a reducer dynamically
		const bReducer = withStorageKey( 'B', withKeyPrefix( 'B' ) );
		const cReducer = withStorageKey( 'C', withKeyPrefix( 'C' ) );

		expect( () => {
			addReducerToStore( store )( [ 'b' ], bReducer );
			addReducerToStore( store )( [ 'b' ], cReducer );
		} ).toThrow();
	} );
} );
