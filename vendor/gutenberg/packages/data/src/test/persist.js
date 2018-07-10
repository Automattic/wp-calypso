/**
 * External dependencies
 */
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { loadAndPersist, withRehydration } from '../persist';

describe( 'loadAndPersist', () => {
	const persistenceStorage = window.localStorage;

	it( 'should load the initial value from the local storage integrating it into reducer default value.', () => {
		const storageKey = 'dumbStorageKey';
		persistenceStorage.setItem( storageKey, JSON.stringify( { chicken: true } ) );
		const reducer = () => {
			return {
				preferences: { ribs: true },
			};
		};
		const store = createStore( withRehydration( reducer, 'preferences', storageKey ) );
		loadAndPersist(
			store,
			reducer,
			'preferences',
			storageKey,
		);
		expect( store.getState().preferences ).toEqual( { chicken: true, ribs: true } );
	} );

	it( 'should not load the initial value from the local storage if the storage key is different.', () => {
		const storageKey = 'dumbStorageKey';
		persistenceStorage.setItem( storageKey, JSON.stringify( { chicken: true } ) );
		const reducer = () => {
			return {
				preferences: { ribs: true },
			};
		};
		const store = createStore( withRehydration( reducer, 'preferences', storageKey + 'change' ) );
		loadAndPersist(
			store,
			reducer,
			'preferences',
			storageKey,
		);
		expect( store.getState().preferences ).toEqual( { ribs: true } );
	} );

	it( 'should persist to local storage once the state value changes', () => {
		const storageKey = 'dumbStorageKey2';
		const reducer = ( state, action ) => {
			if ( action.type === 'SERIALIZE' ) {
				return state;
			}

			if ( action.type === 'UPDATE' ) {
				return {
					preferences: { chicken: true },
				};
			}

			return {
				preferences: { ribs: true },
			};
		};
		const store = createStore( withRehydration( reducer, 'preferences', storageKey ) );
		loadAndPersist(
			store,
			reducer,
			'preferences',
			storageKey,
		);
		store.dispatch( { type: 'UPDATE' } );
		expect( JSON.parse( persistenceStorage.getItem( storageKey ) ) ).toEqual( { chicken: true } );
	} );

	it( 'should apply defaults to any missing properties on previously stored objects', () => {
		const defaultsPreferences = {
			counter: 41,
		};
		const storageKey = 'dumbStorageKey3';
		const reducer = ( state = { preferences: defaultsPreferences }, action ) => {
			if ( action.type === 'INCREMENT' ) {
				return {
					preferences: { counter: state.preferences.counter + 1 },
				};
			}
			return state;
		};

		// store preferences without the `counter` default
		persistenceStorage.setItem( storageKey, JSON.stringify( {} ) );

		const store = createStore( withRehydration( reducer, 'preferences', storageKey ) );
		loadAndPersist(
			store,
			reducer,
			'preferences',
			storageKey,
		);
		store.dispatch( { type: 'INCREMENT' } );

		// the default should have been applied, as the `counter` was missing from the
		// saved preferences, then the INCREMENT action should have taken effect to give us 42
		expect( JSON.parse( persistenceStorage.getItem( storageKey ) ) ).toEqual( { counter: 42 } );
	} );

	it( 'should not override stored values with defaults', () => {
		const defaultsPreferences = {
			counter: 41,
		};
		const storageKey = 'dumbStorageKey4';
		const reducer = ( state = { preferences: defaultsPreferences }, action ) => {
			if ( action.type === 'INCREMENT' ) {
				return {
					preferences: { counter: state.preferences.counter + 1 },
				};
			}
			return state;
		};

		persistenceStorage.setItem( storageKey, JSON.stringify( { counter: 1 } ) );

		const store = createStore( withRehydration( reducer, 'preferences', storageKey ) );

		loadAndPersist(
			store,
			reducer,
			'preferences',
			storageKey,
		);
		store.dispatch( { type: 'INCREMENT' } );

		expect( JSON.parse( persistenceStorage.getItem( storageKey ) ) ).toEqual( { counter: 2 } );
	} );
} );
