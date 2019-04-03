/**
 * @format
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
import localforage from 'lib/localforage';
import userFactory from 'lib/user';
import { isSupportSession } from 'lib/user/support-user-interop';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import { createReduxStore } from 'state';
import initialReducer from 'state/reducer';
import { getInitialState, persistOnChange, MAX_AGE, SERIALIZE_THROTTLE } from 'state/initial-state';
import { combineReducers, withStorageKey } from 'state/utils';
import { addReducerToStore } from 'state/add-reducer';

jest.mock( 'config', () => {
	let persistReduxEnabled = false;

	const config = () => 'development';

	config.isEnabled = jest.fn( key => key === 'persist-redux' && persistReduxEnabled );
	config.isEnabled.enablePersistRedux = () => ( persistReduxEnabled = true );
	config.isEnabled.disablePersistRedux = () => ( persistReduxEnabled = false );

	return config;
} );

jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
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

				beforeAll( async () => {
					window.initialReduxState = serverState;
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					state = await getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
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

					beforeAll( async () => {
						isEnabled.enablePersistRedux();
						isSupportSession.mockReturnValue( true );
						window.initialReduxState = { currentUser: { currencyCode: 'USD' } };
						consoleErrorSpy = jest.spyOn( global.console, 'error' );
						getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
						state = await getInitialState( initialReducer );
					} );

					afterAll( () => {
						isEnabled.disablePersistRedux();
						isSupportSession.mockReturnValue( false );
						window.initialReduxState = null;
						consoleErrorSpy.mockRestore();
						getItemSpy.mockRestore();
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

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					state = await getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
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

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					state = await getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
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

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					state = await getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
				} );

				test( 'builds initial state without errors', () => {
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

				beforeAll( async () => {
					window.initialReduxState = serverState;
					isEnabled.enablePersistRedux();
					consoleErrorSpy = jest.spyOn( global.console, 'error' );
					getItemSpy = jest.spyOn( localforage, 'getItem' ).mockResolvedValue( savedState );
					state = await getInitialState( initialReducer );
				} );

				afterAll( () => {
					window.initialReduxState = null;
					isEnabled.disablePersistRedux();
					consoleErrorSpy.mockRestore();
					getItemSpy.mockRestore();
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
		} );
	} );

	describe( '#persistOnChange()', () => {
		let store, clock, setItemSpy;

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

		beforeEach( () => {
			isEnabled.enablePersistRedux();
			// we use fake timers from Sinon (aka Lolex) because `lodash.throttle` also uses `Date.now()`
			// and relies on it returning a mocked value. Jest fake timers don't mock `Date`, Lolex does.
			clock = useFakeTimers();
			setItemSpy = jest
				.spyOn( localforage, 'setItem' )
				.mockImplementation( value => Promise.resolve( value ) );

			store = createReduxStore( initialState, reducer );
			persistOnChange( store );
		} );

		afterEach( () => {
			isEnabled.enablePersistRedux();
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
			expect( setItemSpy ).toHaveBeenCalledWith(
				'redux-state-123456789',
				expect.objectContaining( { data: 3 } )
			);
			expect( setItemSpy ).toHaveBeenCalledWith(
				'redux-state-123456789',
				expect.objectContaining( { data: 5 } )
			);
		} );
	} );
} );

describe( 'loading stored state with dynamic reducers', () => {
	// Creates a reducer that serializes objects by prefixing all keys with a given prefix.
	// For example, `withKeyPrefix( 'A' )` serializes `{ x: 1, y: 2 }` into `{ 'A:x': 1, 'A:y': 2 }`
	const withKeyPrefix = keyPrefix => {
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

	let getItemSpy;

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
		};

		// localforage mock to return mock IndexedDB state
		getItemSpy = jest
			.spyOn( localforage, 'getItem' )
			.mockImplementation( key => storedState[ key ] );
	} );

	afterEach( () => {
		isEnabled.disablePersistRedux();
		getItemSpy.mockRestore();
	} );

	test( 'loads state from multiple storage keys', async () => {
		// initial reducer. includes several subreducers with storageKey property
		const reducer = combineReducers( {
			currentUser: currentUserReducer,
			a: withStorageKey( 'A', withKeyPrefix( 'A' ) ),
			b: withStorageKey( 'B', withKeyPrefix( 'B' ) ),
		} );

		// load initial state and create Redux store with it
		const state = await getInitialState( reducer );
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
		const state = await getInitialState( reducer );
		const store = createReduxStore( state, reducer );

		// verify that the initial Redux store loaded state only for `currentUser`
		expect( store.getState() ).toEqual( {
			currentUser: {
				id: 123456789,
			},
		} );

		// load a reducer dynamically
		const aReducer = withStorageKey( 'A', withKeyPrefix( 'A' ) );
		await addReducerToStore( store )( 'a', aReducer );

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
} );
