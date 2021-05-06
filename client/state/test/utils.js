/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { APPLY_STORED_STATE } from 'calypso/state/action-types';
import {
	keyedReducer,
	withSchemaValidation,
	combineReducers,
	isValidStateWithSchema,
	withPersistence,
	serialize,
	deserialize,
} from 'calypso/state/utils';

/**
 * WordPress dependencies
 */
import warn from '@wordpress/warning';

jest.mock( '@wordpress/warning', () => jest.fn() );

describe( 'utils', () => {
	beforeEach( () => warn.mockReset() );

	describe( '#keyedReducer', () => {
		const grow = ( name ) => ( { type: 'GROW', name } );
		const reset = ( name ) => ( { type: 'RESET', name } );
		const remove = ( name ) => ( { type: 'REMOVE', name } );

		const age = ( state = 0, action ) => {
			if ( 'GROW' === action.type ) {
				return state + 1;
			} else if ( 'RESET' === action.type ) {
				return 0;
			} else if ( 'REMOVE' === action.type ) {
				return undefined;
			}
			return state;
		};

		const prevState = deepFreeze( {
			Bonobo: 13,
		} );

		test( 'should only accept string-type key names', () => {
			expect( () => keyedReducer( null, age ) ).toThrow( TypeError );
			expect( () => keyedReducer( undefined, age ) ).toThrow( TypeError );
			expect( () => keyedReducer( [], age ) ).toThrow( TypeError );
			expect( () => keyedReducer( {}, age ) ).toThrow( TypeError );
			expect( () => keyedReducer( true, age ) ).toThrow( TypeError );
			expect( () => keyedReducer( 10, age ) ).toThrow( TypeError );
			expect( () => keyedReducer( 15.4, age ) ).toThrow( TypeError );
			expect( () => keyedReducer( '', age ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', age ) ).not.toThrow( TypeError );
		} );

		test( 'should only accept a function as the reducer argument', () => {
			expect( () => keyedReducer( 'key', null ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', undefined ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', [] ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', {} ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', true ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', 10 ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', 15.4 ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', '' ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key' ) ).toThrow( TypeError );
			expect( () => keyedReducer( 'key', () => {} ).not.toThrow( TypeError ) );
		} );

		test( 'should create keyed state given simple reducers', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( undefined, grow( 'Calypso' ) ) ).toEqual( {
				Calypso: 1,
			} );
		} );

		test( 'should handle keyNames referencing nested keys', () => {
			const keyed = keyedReducer( 'person.name', age );
			const action = { type: 'GROW', person: { name: 'Calypso' } };
			expect( keyed( undefined, action ) ).toEqual( {
				Calypso: 1,
			} );
		} );

		test( 'should only affect the keyed item in a collection', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, grow( 'Calypso' ) ) ).toEqual( {
				Bonobo: 13,
				Calypso: 1,
			} );
		} );

		test( 'should skip if no key is provided in the action', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'GROW' } ) ).toBe( prevState );
		} );

		test( 'should handle falsey keys', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { [ 0 ]: 10 }, grow( 0 ) ) ).toEqual( { 0: 11 } );
		} );

		test( 'should handle coerced-to-string keys', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { 10: 10 }, grow( '10' ) ) ).toEqual( { 10: 11 } );
			expect( keyed( { [ 10 ]: 10 }, grow( '10' ) ) ).toEqual( { 10: 11 } );
			expect( keyed( { [ 10 ]: 10 }, grow( 10 ) ) ).toEqual( { 10: 11 } );
			expect( keyed( { 10: 10 }, grow( 10 ) ) ).toEqual( { 10: 11 } );
		} );

		test( 'should return without changes if no actual changes occur', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'STAY', name: 'Bonobo' } ) ).toBe( prevState );
		} );

		test( 'should not initialize a state if no changes and not keyed (simple state)', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'STAY', name: 'Calypso' } ) ).toBe( prevState );
		} );

		test( 'should remove keys if set back to initialState', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { 10: 10 }, reset( '10' ) ) ).toEqual( {} );
		} );

		test( 'should remove keys if set to undefined', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { 10: 10 }, remove( '10' ) ) ).toEqual( {} );
		} );

		test( 'should disable persistence by default', () => {
			const reducer = keyedReducer( 'id', age );

			expect( serialize( reducer, { a: 10 } ) ).toBeUndefined();
			expect( deserialize( reducer, { a: 10 } ) ).toEqual( {} );
		} );

		test( 'should handle serialize and deserialize calls', () => {
			const chickenReducer = withPersistence(
				( state = '', { type } ) => {
					switch ( type ) {
						case 'SET_CHICKEN':
							return 'chicken';
						default:
							return state;
					}
				},
				{
					serialize: () => 'serialized chicken',
					deserialize: () => 'deserialized chicken',
				}
			);

			const keyed = keyedReducer( 'id', chickenReducer );
			const prev = { 1: 'chicken' };

			expect( keyed( prev, { type: 'SET_CHICKEN', id: 2 } ) ).toEqual( {
				1: 'chicken',
				2: 'chicken',
			} );
			expect( serialize( keyed, prev ).root() ).toEqual( { 1: 'serialized chicken' } );
			expect( deserialize( keyed, prev ) ).toEqual( { 1: 'deserialized chicken' } );
		} );

		test( 'should omit initial/undefined state from serialize/deserialize results', () => {
			const itemReducer = withPersistence( ( state = 0 ) => state, {
				// don't persist unlucky numbers
				serialize: ( state ) => ( state !== 13 ? state : undefined ),
				deserialize: ( persisted ) => ( persisted !== 13 ? persisted : undefined ),
			} );

			const keyed = keyedReducer( 'id', itemReducer );
			const state = { a: 13, b: 0, c: 1 };
			expect( serialize( keyed, state ).root() ).toEqual( { c: 1 } );
			expect( deserialize( keyed, state ) ).toEqual( { c: 1 } );
		} );

		test( 'should not serialize empty state', () => {
			const keyed = keyedReducer( 'id', withPersistence( age ) );
			expect( serialize( keyed, {} ) ).toBeUndefined();
		} );

		test( 'should serialize non-empty state', () => {
			const keyed = keyedReducer( 'id', withPersistence( age ) );

			// state with non-initial value
			const state = { 1: 1 };
			const serialized = serialize( keyed, state );
			expect( serialized.root() ).toEqual( { 1: 1 } );
		} );

		test( 'should not serialize nested empty state', () => {
			const schema = {
				type: 'object',
				additionalProperties: false,
				patternProperties: { '^\\d+$': { type: 'number' } },
			};

			const keyedWithPersistence = withSchemaValidation(
				schema,
				keyedReducer( 'id', withPersistence( age ) )
			);
			const nestedReducer = combineReducers( { a: keyedWithPersistence } );

			// state with non-initial value should serialize: sanity check that we are testing the
			// right thing.
			// Another reason why empty state might not be persisted is that the tested reducer didn't
			// opt in into persistence in the first place -- and we DON'T want to test that!
			const stateWithData = { a: { 1: 1 } };
			const serializedWithData = serialize( nestedReducer, stateWithData );
			expect( serializedWithData.root() ).toEqual( { a: { 1: 1 } } );

			// initial state should not serialize
			const state = nestedReducer( undefined, { type: 'INIT' } );
			expect( state ).toEqual( { a: {} } );
			expect( serialize( nestedReducer, state ) ).toBeUndefined();
		} );

		test( 'should deserialize no state into default empty state', () => {
			const keyed = keyedReducer( 'id', withPersistence( age ) );
			expect( deserialize( keyed, undefined ) ).toEqual( {} );
		} );
	} );

	describe( '#isValidStateWithSchema', () => {
		test( 'should return true for valid state', () => {
			const result = isValidStateWithSchema( 'a string', { type: 'string' } );
			expect( result ).toBe( true );
		} );

		test( 'should return false for invalid state', () => {
			const result = isValidStateWithSchema( 'a string', { type: 'null' } );
			expect( result ).toBe( false );
		} );

		test( 'should warn for invalid state', () => {
			isValidStateWithSchema( 'a string', { type: 'null' } );
			expect( warn ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( '#withSchemaValidation', () => {
		const normal = { type: 'NORMAL' };
		const grow = { type: 'GROW' };
		const schema = {
			type: 'number',
			minimum: 0,
		};

		const age = ( state = 0, action ) => ( 'GROW' === action.type ? state + 1 : state );

		test( 'should always pass valid state to the inner serialize handler', () => {
			const date = withSchemaValidation(
				schema,
				withPersistence(
					( state = new Date( 0 ), action ) => {
						switch ( action.type ) {
							case 'GROW':
								return new Date( state.getTime() + 1 );
							default:
								return state;
						}
					},
					{
						serialize: ( state ) => state.getTime(),
						deserialize: ( persisted ) => new Date( persisted ),
					}
				)
			);

			expect( deserialize( date, 0 ) ).toEqual( new Date( 0 ) );
		} );

		test( 'should invalidate on deserialize call', () => {
			const validated = withSchemaValidation( schema, age );
			expect( deserialize( validated, -5 ) ).toBe( 0 );
		} );

		test( 'should not invalidate on normal action dispatch', () => {
			const validated = withSchemaValidation( schema, age );
			expect( validated( -5, normal ) ).toBe( -5 );
		} );

		test( 'should validate initial state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( deserialize( validated, 5 ) ).toBe( 5 );
		} );

		test( 'actions work as expected with schema', () => {
			const validated = withSchemaValidation( schema, age );
			expect( validated( 5, grow ) ).toBe( 6 );
		} );
	} );

	describe( '#combineReducers', () => {
		const grow = { type: 'GROW' };
		const schema = {
			type: 'number',
			minimum: 0,
		};

		const age = withSchemaValidation( schema, ( state = 0, action ) =>
			'GROW' === action.type ? state + 1 : state
		);
		const height = ( state = 160, action ) => ( 'GROW' === action.type ? state + 1 : state );
		const count = ( state = 1, action ) => ( 'GROW' === action.type ? state + 1 : state );

		const date = withPersistence(
			( state = new Date( 0 ), action ) => {
				switch ( action.type ) {
					case 'GROW':
						return new Date( state.getTime() + 1 );
					default:
						return state;
				}
			},
			{
				serialize: ( state ) => state.getTime(),
				deserialize: ( persisted ) => {
					if ( isValidStateWithSchema( persisted, schema ) ) {
						return new Date( persisted );
					}
					return new Date( 0 );
				},
			}
		);

		let reducers;

		beforeEach( () => {
			reducers = combineReducers( {
				age,
				height,
			} );
		} );

		const appState = deepFreeze( {
			age: 20,
			height: 171,
		} );

		test( 'should return initial state on init', () => {
			const state = reducers( undefined, { type: '@@calypso/INIT' } );
			expect( state ).toEqual( { age: 0, height: 160 } );
		} );

		test( 'should return initial state on deserialize', () => {
			const state = deserialize( reducers, undefined );
			expect( state ).toEqual( { age: 0, height: 160 } );
		} );

		test( 'should not persist height, because it is missing a schema', () => {
			const state = serialize( reducers, appState );
			expect( state.root() ).toEqual( { age: 20 } );
		} );

		test( 'should not load height, because it is missing a schema', () => {
			const state = deserialize( reducers, appState );
			expect( state ).toEqual( { age: 20, height: 160 } );
		} );

		test( 'should validate age', () => {
			const state = deserialize( reducers, { age: -5 } );
			expect( state ).toEqual( { age: 0, height: 160 } );
		} );

		test( 'actions work as expected', () => {
			const state = reducers( appState, grow );
			expect( state ).toEqual( { age: 21, height: 172 } );
		} );

		test( 'undefined or missing state is not serialized and does not cause errors', () => {
			const empty = serialize( reducers, undefined );
			expect( empty ).toBeUndefined();

			const nested = combineReducers( {
				person: reducers,
				date,
			} );

			const missingPerson = serialize( nested, { date: new Date( 100 ) } );
			expect( missingPerson.root() ).toEqual( { date: 100 } );
		} );

		test( 'nested reducers work on load', () => {
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
				count,
			} );
			const valid = deserialize( nested, { person: { age: 22, date: 224 } } );
			expect( valid ).toEqual( {
				person: { age: 22, height: 160, date: new Date( 224 ) },
				count: 1,
			} );

			const invalid = deserialize( nested, { person: { age: -5, height: 100, date: -5 } } );
			expect( invalid ).toEqual( {
				person: { age: 0, height: 160, date: new Date( 0 ) },
				count: 1,
			} );
		} );

		test( 'nested reducers work on persist', () => {
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
				count,
			} );
			const valid = serialize( nested, { person: { age: 22, date: new Date( 224 ) } } );
			expect( valid.root() ).toEqual( { person: { age: 22, date: 224 } } );

			const invalid = serialize( nested, {
				person: { age: -5, height: 100, date: new Date( -500 ) },
			} );
			expect( invalid.root() ).toEqual( { person: { age: -5, date: -500 } } );
		} );

		test( 'nested reducers leave out a state slice where none of the children is persisted', () => {
			const ephemeral = combineReducers( {
				height,
				count,
			} );

			const nestedEphemeral = combineReducers( {
				ephemeral,
				age,
			} );

			const stored = serialize( nestedEphemeral, {
				// the `ephemeral` object should not be stored at all
				ephemeral: { height: 100, count: 5 },
				// `age` should be persisted, as it has a schema defined
				age: 40,
			} );
			expect( stored.root() ).toEqual( { age: 40 } );
		} );

		test( 'deeply nested reducers work on load', () => {
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
			} );
			const veryNested = combineReducers( {
				bob: nested,
				count,
			} );
			const valid = deserialize( veryNested, {
				bob: { person: { age: 22, date: 224 } },
				count: 122,
			} );
			expect( valid ).toEqual( {
				bob: { person: { age: 22, height: 160, date: new Date( 224 ) } },
				count: 1,
			} );

			const invalid = deserialize( veryNested, {
				bob: { person: { age: -5, height: 22, date: -500 } },
				count: 123,
			} );
			expect( invalid ).toEqual( {
				bob: { person: { age: 0, height: 160, date: new Date( 0 ) } },
				count: 1,
			} );
		} );

		test( 'deeply nested reducers work on persist', () => {
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
			} );
			const veryNested = combineReducers( {
				bob: nested,
				count,
			} );
			const valid = serialize( veryNested, {
				bob: { person: { age: 22, date: new Date( 234 ) } },
				count: 122,
			} );
			expect( valid.root() ).toEqual( { bob: { person: { age: 22, date: 234 } } } );

			const invalid = serialize( veryNested, {
				bob: { person: { age: -5, height: 22, date: new Date( -5 ) } },
				count: 123,
			} );
			expect( invalid.root() ).toEqual( { bob: { person: { age: -5, date: -5 } } } );
		} );

		test( 'deeply nested reducers work with reducer with a custom handler', () => {
			reducers = combineReducers( {
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
			} );
			const veryNested = combineReducers( {
				bob: nested,
				count,
			} );
			const valid = serialize( veryNested, {
				bob: { person: { date: new Date( 234 ) } },
				count: 122,
			} );
			expect( valid.root() ).toEqual( { bob: { person: { date: 234 } } } );

			const invalid = serialize( veryNested, {
				bob: { person: { height: 22, date: new Date( -5 ) } },
				count: 123,
			} );
			expect( invalid.root() ).toEqual( { bob: { person: { date: -5 } } } );
		} );

		test( 'uses the provided validation from withSchemaValidation', () => {
			reducers = combineReducers( {
				height: withSchemaValidation( schema, height ),
				count,
			} );

			const valid = serialize( reducers, { height: 22, count: 44 } );
			expect( valid.root() ).toEqual( { height: 22 } );

			const invalid = deserialize( reducers, { height: -1, count: 44 } );
			expect( invalid ).toEqual( { height: 160, count: 1 } );
		} );
	} );
} );

describe( 'addReducer', () => {
	// creator of toy reducers that initialize to `initialValue` and don't react to other actions
	const toyReducer = ( initialValue ) => ( state = initialValue ) => state;

	describe( 'basic tests', () => {
		test( 'can add a new top-level reducer', () => {
			const origReducer = combineReducers( {
				a: toyReducer( 'Hello from A' ),
			} );

			const newReducer = origReducer.addReducer( [ 'b' ], toyReducer( 'Hello from B' ) );

			expect( newReducer( undefined, { type: 'INIT' } ) ).toEqual( {
				a: 'Hello from A',
				b: 'Hello from B',
			} );
		} );

		test( 'can add a new nested reducer', () => {
			const origReducer = combineReducers( {
				a: combineReducers( {
					a: toyReducer( 'Hello from A.A' ),
				} ),
			} );

			const newReducer = origReducer
				.addReducer( [ 'a', 'b' ], toyReducer( 'Hello from A.B' ) )
				.addReducer( [ 'a', 'c', 'd' ], toyReducer( 'Hello from A.C.D' ) );

			expect( newReducer( undefined, { type: 'INIT' } ) ).toEqual( {
				a: {
					a: 'Hello from A.A',
					b: 'Hello from A.B',
					c: {
						d: 'Hello from A.C.D',
					},
				},
			} );
		} );

		test( 'fails when trying to add reducer to an occupied', () => {
			const origReducer = combineReducers( {
				a: toyReducer( 'Hello from A' ),
			} );

			expect( () => {
				origReducer.addReducer( [ 'a' ], toyReducer( 'Hello from wannabe A' ) );
			} ).toThrow( "Reducer with key 'a' is already registered" );
		} );

		test( 'fails when trying to add reducer to an unsupported spot', () => {
			const origReducer = combineReducers( {
				a: toyReducer( 'Hello from A' ),
			} );

			expect( () => {
				origReducer.addReducer( [ 'a', 'b' ], toyReducer( 'Hello from A.B' ) );
			} ).toThrow( "New reducer can be added only into a reducer created with 'combineReducers'" );
		} );
	} );

	describe( 'interaction with persistence', () => {
		const persistedToyReducer = ( initialState ) =>
			withSchemaValidation( { type: 'string' }, toyReducer( initialState ) );

		test( 'storageKey survives adding a new reducer', () => {
			const origReducer = withStorageKey(
				'foo',
				combineReducers( {
					a: withStorageKey(
						'keyA',
						combineReducers( {
							b: persistedToyReducer( 'Hello from keyA.b' ),
						} )
					),
				} )
			);

			const newReducer = origReducer.addReducer(
				[ 'a', 'c' ],
				persistedToyReducer( 'Hello from keyA.c' )
			);

			const state = newReducer( undefined, { type: 'INIT' } );
			const serializedState = serialize( newReducer, state );

			expect( serializedState.get() ).toEqual( {
				keyA: {
					b: 'Hello from keyA.b',
					c: 'Hello from keyA.c',
				},
			} );
		} );
	} );
} );

describe( 'withStorageKey', () => {
	test( 'reducer with storage key is serialized into separate object', () => {
		// persisted reducer that will be a part of root state
		const posts = withSchemaValidation( { type: 'string' }, ( state = 'postsState' ) => state );

		// persisted reducer with its own persistence key
		const reader = withStorageKey(
			'readerKey',
			withSchemaValidation( { type: 'string' }, ( state = 'readerState' ) => state )
		);

		// combine the two reducers into one
		const reducer = combineReducers( {
			posts,
			reader,
		} );

		// initialize the state
		const state = reducer( undefined, { type: 'INIT' } );

		// and serialize
		const result = serialize( reducer, state );

		expect( result.get() ).toEqual( {
			root: { posts: 'postsState' },
			readerKey: 'readerState',
		} );
	} );
} );

describe( 'applyStoredState', () => {
	// factory to manufacture toy reducers with custom persistence
	const toyReducer = () => withPersistence( ( state = null ) => state );

	test( 'stored state is correctly implanted into the right location', () => {
		const reducer = combineReducers( {
			a: toyReducer(),
			b: withStorageKey( 'B', toyReducer() ),
		} );
		const action = { type: APPLY_STORED_STATE, storageKey: 'B', storedState: 'b+' };
		const state = {
			a: 'a',
			b: 'b',
		};
		expect( reducer( state, action ) ).toEqual( {
			a: 'a',
			b: 'b+',
		} );
	} );

	test( 'stored state is correctly implanted into a nested location', () => {
		const reducer = combineReducers( {
			a: toyReducer(),
			b: combineReducers( {
				c: toyReducer(),
				d: withStorageKey( 'D', toyReducer() ),
			} ),
		} );
		const action = { type: APPLY_STORED_STATE, storageKey: 'D', storedState: 'd+' };
		const state = {
			a: 'a',
			b: {
				c: 'c',
				d: 'd',
			},
		};
		expect( reducer( state, action ) ).toEqual( {
			a: 'a',
			b: {
				c: 'c',
				d: 'd+',
			},
		} );
	} );

	test( "implanting a stored state doesn't change identity of other state trees", () => {
		const reducer = combineReducers( {
			a: combineReducers( {
				b: toyReducer(),
				c: toyReducer(),
			} ),
			d: withStorageKey( 'D', toyReducer() ),
		} );
		const action = { type: APPLY_STORED_STATE, storageKey: 'D', storedState: 'd+' };
		const prevState = {
			a: {
				b: 'b',
				c: 'c',
			},
			d: 'd',
		};
		const nextState = reducer( prevState, action );
		expect( nextState.a ).toBe( prevState.a ); // identical objects
		expect( nextState.d ).toBe( 'd+' ); // stored state got implanted
	} );
} );
