/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { APPLY_STORED_STATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import {
	extendAction,
	keyedReducer,
	withSchemaValidation,
	combineReducers,
	isValidStateWithSchema,
	withoutPersistence,
	withEnhancers,
	withStorageKey,
} from 'state/utils';
import warn from 'lib/warn';

jest.mock( 'lib/warn', () => jest.fn() );

describe( 'utils', () => {
	beforeEach( () => warn.mockReset() );

	describe( 'extendAction()', () => {
		test( 'should return an updated action object, merging data', () => {
			const action = extendAction(
				{
					type: 'ACTION_TEST',
					meta: {
						preserve: true,
					},
				},
				{
					meta: {
						ok: true,
					},
				}
			);

			expect( action ).toEqual( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true,
				},
			} );
		} );

		test( 'should return an updated action thunk, merging data on dispatch', () => {
			const dispatch = jest.fn();
			const action = extendAction(
				( thunkDispatch ) =>
					thunkDispatch( {
						type: 'ACTION_TEST',
						meta: {
							preserve: true,
						},
					} ),
				{
					meta: {
						ok: true,
					},
				}
			);

			action( dispatch );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true,
				},
			} );
		} );

		test( 'should return an updated action thunk, accepting also getState', () => {
			const dispatch = jest.fn();
			const getState = () => ( { selectedSiteId: 42 } );

			const action = extendAction(
				( thunkDispatch, thunkGetState ) =>
					thunkDispatch( {
						type: 'ACTION_TEST',
						siteId: thunkGetState().selectedSiteId,
						meta: {
							preserve: true,
						},
					} ),
				{
					meta: {
						ok: true,
					},
				}
			);

			action( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'ACTION_TEST',
				siteId: 42,
				meta: {
					preserve: true,
					ok: true,
				},
			} );
		} );

		test( 'should return an updated nested action thunk, merging data on dispatch', () => {
			const dispatch = jest.fn();
			const action = extendAction(
				( thunkDispatch ) =>
					thunkDispatch( ( nestedThunkDispatch ) =>
						nestedThunkDispatch( {
							type: 'ACTION_TEST',
							meta: {
								preserve: true,
							},
						} )
					),
				{
					meta: {
						ok: true,
					},
				}
			);

			action( dispatch );
			dispatch.mock.calls[ 0 ][ 0 ]( dispatch );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true,
				},
			} );
		} );
	} );

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

		test( 'should handle SERIALIZE and DESERIALIZE as global actions', () => {
			const chickenReducer = ( state = '', { type } ) => {
				switch ( type ) {
					case 'SET_CHICKEN':
						return 'chicken';
					case 'SERIALIZE':
						return 'serialized chicken';
					case 'DESERIALIZE':
						return 'deserialized chicken';
					default:
						return state;
				}
			};

			const keyed = keyedReducer( 'id', chickenReducer );
			const prev = { 1: 'chicken' };

			expect( keyed( prev, { type: 'SET_CHICKEN', id: 2 } ) ).toEqual( {
				1: 'chicken',
				2: 'chicken',
			} );
			expect( keyed( prev, { type: 'SERIALIZE' } ).root() ).toEqual( { 1: 'serialized chicken' } );
			expect( keyed( prev, { type: 'DESERIALIZE' } ) ).toEqual( { 1: 'deserialized chicken' } );
		} );

		test( 'should omit initial/undefined state from SERIALIZE/DESERIALIZE results', () => {
			const itemReducer = ( state = 0, { type } ) => {
				switch ( type ) {
					case 'SERIALIZE':
					case 'DESERIALIZE':
						// don't persist unlucky numbers
						return state !== 13 ? state : undefined;
					default:
						return state;
				}
			};

			const keyed = keyedReducer( 'id', itemReducer );
			const state = { a: 13, b: 0, c: 1 };
			expect( keyed( state, { type: 'SERIALIZE' } ).root() ).toEqual( { c: 1 } );
			expect( keyed( state, { type: 'DESERIALIZE' } ) ).toEqual( { c: 1 } );
		} );

		test( 'should not serialize empty state', () => {
			const keyed = keyedReducer( 'id', age );
			expect( keyed( {}, { type: 'SERIALIZE' } ) ).toBeUndefined();
		} );

		test( 'should serialize non-empty state', () => {
			const keyed = keyedReducer( 'id', age );

			// state with non-initial value
			const state = { '1': 1 };
			const serialized = keyed( state, { type: 'SERIALIZE' } );
			expect( serialized.root() ).toEqual( { '1': 1 } );
		} );

		test( 'should not serialize nested empty state', () => {
			const schema = {
				type: 'object',
				additionalProperties: false,
				patternProperties: { '^\\d+$': { type: 'number' } },
			};

			const keyedWithPersistence = withSchemaValidation( schema, keyedReducer( 'id', age ) );
			const nestedReducer = combineReducers( { a: keyedWithPersistence } );

			// state with non-initial value should serialize: sanity check that we are testing the
			// right thing.
			// Another reason why empty state might not be persisted is that the tested reducer didn't
			// opt in into persistence in the first place -- and we DON'T want to test that!
			const stateWithData = { a: { '1': 1 } };
			const serializedWithData = nestedReducer( stateWithData, { type: 'SERIALIZE' } );
			expect( serializedWithData.root() ).toEqual( { a: { '1': 1 } } );

			// initial state should not serialize
			const state = nestedReducer( undefined, { type: 'INIT' } );
			expect( state ).toEqual( { a: {} } );
			expect( nestedReducer( state, { type: 'SERIALIZE' } ) ).toBeUndefined();
		} );

		test( 'should deserialize no state into default empty state', () => {
			const keyed = keyedReducer( 'id', age );
			expect( keyed( undefined, { type: 'DESERIALIZE' } ) ).toEqual( {} );
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
		const load = { type: DESERIALIZE };
		const normal = { type: 'NORMAL' };
		const grow = { type: 'GROW' };
		const schema = {
			type: 'number',
			minimum: 0,
		};

		const age = ( state = 0, action ) => ( 'GROW' === action.type ? state + 1 : state) ;

		const date = ( state = new Date( 0 ), action ) => {
			switch ( action.type ) {
				case 'GROW':
					return new Date( state.getTime() + 1 );
				case SERIALIZE:
					return state.getTime();
				case DESERIALIZE:
					if ( isValidStateWithSchema( state, schema ) ) {
						return new Date( state );
					}
					return new Date( 0 );
				default:
					return state;
			}
		};
		date.hasCustomPersistence = true;

		test( 'should invalidate DESERIALIZED state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( -5, load ) ).toBe( 0 );
		} );

		test( 'should not invalidate normal state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( -5, normal ) ).toBe( -5 );
		} );

		test( 'should validate initial state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( 5, load ) ).toBe( 5 );
		} );

		test( 'actions work as expected with schema', () => {
			const validated = withSchemaValidation( schema, age );
			expect( validated( 5, grow ) ).toBe( 6 );
		} );
	} );

	describe( '#combineReducers', () => {
		const load = { type: DESERIALIZE };
		const write = { type: SERIALIZE };
		const grow = { type: 'GROW' };
		const schema = {
			type: 'number',
			minimum: 0,
		};

		const age = withSchemaValidation( schema, ( state = 0, action ) =>
			'GROW' === action.type ? state + 1 : state
		);
		const height = ( state = 160, action ) => ( 'GROW' === action.type ? state + 1 : state) ;
		const count = ( state = 1, action ) => ( 'GROW' === action.type ? state + 1 : state) ;

		const date = ( state = new Date( 0 ), action ) => {
			switch ( action.type ) {
				case 'GROW':
					return new Date( state.getTime() + 1 );
				case SERIALIZE:
					return state.getTime();
				case DESERIALIZE:
					if ( isValidStateWithSchema( state, schema ) ) {
						return new Date( state );
					}
					return new Date( 0 );
				default:
					return state;
			}
		};
		date.hasCustomPersistence = true;

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

		test( 'should return initial state on DESERIALIZE', () => {
			const state = reducers( undefined, load );
			expect( state ).toEqual( { age: 0, height: 160 } );
		} );

		test( 'should not persist height, because it is missing a schema', () => {
			const state = reducers( appState, write );
			expect( state.root() ).toEqual( { age: 20 } );
		} );

		test( 'should not load height, because it is missing a schema', () => {
			const state = reducers( appState, load );
			expect( state ).toEqual( { age: 20, height: 160 } );
		} );

		test( 'should validate age', () => {
			const state = reducers( { age: -5 }, load );
			expect( state ).toEqual( { age: 0, height: 160 } );
		} );

		test( 'actions work as expected', () => {
			const state = reducers( appState, grow );
			expect( state ).toEqual( { age: 21, height: 172 } );
		} );

		test( 'undefined or missing state is not serialized and does not cause errors', () => {
			const empty = reducers( undefined, write );
			expect( empty ).toBeUndefined();

			const nested = combineReducers( {
				person: reducers,
				date,
			} );

			const missingPerson = nested( { date: new Date( 100 ) }, write );
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
			const valid = nested( { person: { age: 22, date: 224 } }, load );
			expect( valid ).toEqual( {
				person: { age: 22, height: 160, date: new Date( 224 ) },
				count: 1,
			} );

			const invalid = nested( { person: { age: -5, height: 100, date: -5 } }, load );
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
			const valid = nested( { person: { age: 22, date: new Date( 224 ) } }, write );
			expect( valid.root() ).toEqual( { person: { age: 22, date: 224 } } );

			const invalid = nested( { person: { age: -5, height: 100, date: new Date( -500 ) } }, write );
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

			const stored = nestedEphemeral(
				{
					// the `ephemeral` object should not be stored at all
					ephemeral: { height: 100, count: 5 },
					// `age` should be persisted, as it has a schema defined
					age: 40,
				},
				write
			);
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
			const valid = veryNested( { bob: { person: { age: 22, date: 224 } }, count: 122 }, load );
			expect( valid ).toEqual( {
				bob: { person: { age: 22, height: 160, date: new Date( 224 ) } },
				count: 1,
			} );

			const invalid = veryNested(
				{ bob: { person: { age: -5, height: 22, date: -500 } }, count: 123 },
				load
			);
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
			const valid = veryNested(
				{ bob: { person: { age: 22, date: new Date( 234 ) } }, count: 122 },
				write
			);
			expect( valid.root() ).toEqual( { bob: { person: { age: 22, date: 234 } } } );

			const invalid = veryNested(
				{ bob: { person: { age: -5, height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
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
			const valid = veryNested( { bob: { person: { date: new Date( 234 ) } }, count: 122 }, write );
			expect( valid.root() ).toEqual( { bob: { person: { date: 234 } } } );

			const invalid = veryNested(
				{ bob: { person: { height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
			expect( invalid.root() ).toEqual( { bob: { person: { date: -5 } } } );
		} );

		test( 'uses the provided validation from withSchemaValidation', () => {
			reducers = combineReducers( {
				height: withSchemaValidation( schema, height ),
				count,
			} );

			const valid = reducers( { height: 22, count: 44 }, write );
			expect( valid.root() ).toEqual( { height: 22 } );

			const invalid = reducers( { height: -1, count: 44 }, load );
			expect( invalid ).toEqual( { height: 160, count: 1 } );
		} );
	} );

	describe( '#withoutPersistence', () => {
		const age = ( state = 0, { type } ) => {
			if ( 'GROW' === type ) {
				return state + 1;
			}

			if ( DESERIALIZE === type ) {
				return state.age;
			}

			if ( SERIALIZE === type ) {
				return { age: state };
			}

			return state;
		};
		let wrapped;

		beforeAll( () => ( wrapped = withoutPersistence( age ) ) );

		test( 'should pass through normal actions', () => {
			expect( wrapped( 10, { type: 'GROW' } ) ).toBe( 11 );
			expect( wrapped( 10, { type: 'FADE' } ) ).toBe( 10 );
		} );

		test( 'should DESERIALIZE to `initialState`', () => {
			expect( wrapped( 10, { type: DESERIALIZE } ) ).toBe( 0 );
		} );

		test( 'should SERIALIZE to `undefined`', () => {
			expect( wrapped( 10, { type: SERIALIZE } ) ).toBeUndefined();
		} );
	} );

	describe( '#withEnhancers', () => {
		it( 'should enhance action creator', () => {
			const actionCreator = () => ( { type: 'HELLO' } );
			const enhancedActionCreator = withEnhancers( actionCreator, ( action ) =>
				Object.assign( { name: 'test' }, action )
			);
			const thunk = enhancedActionCreator();
			const getState = () => ( {} );
			let dispatchedAction = null;
			const dispatch = ( action ) => ( dispatchedAction = action );
			thunk( dispatch, getState );

			expect( dispatchedAction ).toEqual( {
				name: 'test',
				type: 'HELLO',
			} );
		} );

		it( 'should enhance with multiple enhancers, from last to first', () => {
			const actionCreator = () => ( { type: 'HELLO' } );
			const enhancedActionCreator = withEnhancers( actionCreator, [
				( action ) => Object.assign( { name: 'test' }, action ),
				( action ) => Object.assign( { name: 'test!!!' }, action ),
				( action ) => Object.assign( { meetup: 'akumal' }, action ),
			] );
			const thunk = enhancedActionCreator();
			const getState = () => ( {} );
			let dispatchedAction = null;
			const dispatch = ( action ) => ( dispatchedAction = action );
			thunk( dispatch, getState );

			expect( dispatchedAction ).toEqual( {
				name: 'test',
				type: 'HELLO',
				meetup: 'akumal',
			} );
		} );

		it( 'should provider enhancers with getState function', () => {
			let providedGetState = null;
			const actionCreator = () => ( { type: 'HELLO' } );
			const enhancedActionCreator = withEnhancers( actionCreator, [
				( action, getState ) => {
					providedGetState = getState;
					Object.assign( { name: 'test' }, action );
				},
			] );
			const thunk = enhancedActionCreator();
			const getState = () => ( {} );
			const dispatch = ( action ) => action;
			thunk( dispatch, getState );

			expect( providedGetState ).toEqual( getState );
		} );

		it( 'should accept an action creator as first parameter', () => {
			const actionCreator = () => ( { type: 'HELLO' } );
			const enhancedActionCreator = withEnhancers(
				withEnhancers( actionCreator, ( action ) => Object.assign( { name: 'test' }, action ) ),
				( action ) => Object.assign( { hello: 'world' }, action )
			);

			const thunk = enhancedActionCreator();
			const getState = () => ( {} );
			let dispatchedAction = null;
			const dispatch = ( action ) => ( dispatchedAction = action );
			thunk( dispatch, getState );

			expect( dispatchedAction ).toEqual( {
				name: 'test',
				hello: 'world',
				type: 'HELLO',
			} );
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
			const serializedState = newReducer( state, { type: 'SERIALIZE' } );

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
		const result = reducer( state, { type: 'SERIALIZE' } );

		expect( result.get() ).toEqual( {
			root: { posts: 'postsState' },
			readerKey: 'readerState',
		} );
	} );
} );

describe( 'applyStoredState', () => {
	// factory to manufacture toy reducers with custom persistence
	const toyReducer = () => {
		const r = ( state = null ) => state;
		r.hasCustomPersistence = true;
		return r;
	};

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
