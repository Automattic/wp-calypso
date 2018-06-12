/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { testSchema } from './mocks/schema';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import {
	cachingActionCreatorFactory,
	createReducer,
	extendAction,
	keyedReducer,
	withSchemaValidation,
	combineReducers,
	isValidStateWithSchema,
	withoutPersistence,
	withEnhancers,
} from 'state/utils';
import warn from 'lib/warn';

jest.mock( 'lib/warn', () => jest.fn() );

describe( 'utils', () => {
	beforeEach( () => warn.mockReset() );

	const currentState = deepFreeze( {
			test: [ 'one', 'two', 'three' ],
		} ),
		actionSerialize = { type: SERIALIZE },
		actionDeserialize = { type: DESERIALIZE };
	let reducer;

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
				thunkDispatch =>
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
				thunkDispatch =>
					thunkDispatch( nestedThunkDispatch =>
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

	describe( '#createReducer()', () => {
		describe( 'with null initial state and no handlers', () => {
			beforeAll( () => {
				reducer = createReducer( null, {} );
			} );

			test( 'should return a function', () => {
				expect( typeof reducer ).toBe( 'function' );
			} );

			test( 'should return initial state when hydration action passed', () => {
				expect( reducer( undefined, { type: '@@calypso/INIT' } ) ).toBeNull();
			} );

			test( 'should return identical state when invalid action passed', () => {
				const invalidAction = {};
				expect( reducer( currentState, invalidAction ) ).toBe( currentState );
			} );

			test( 'should return identical state when unknown action type passed', () => {
				const unknownAction = { type: 'UNKNOWN' };
				expect( reducer( currentState, unknownAction ) ).toBe( currentState );
			} );

			test( 'should return undefined when serialize action type passed', () => {
				expect( reducer( currentState, actionSerialize ) ).toBeUndefined();
			} );

			test( 'should return default null state when deserialize action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).toBeNull();
			} );

			test( 'should throw an error when passed an undefined type', () => {
				expect( () => reducer( undefined, { type: undefined } ) ).toThrow();
			} );
		} );

		describe( 'with reducers and default state provided', () => {
			const initialState = {},
				TEST_ADD = 'TEST_ADD';

			beforeAll( () => {
				reducer = createReducer( initialState, {
					[ TEST_ADD ]: ( state, action ) => {
						return {
							test: [ ...state.test, action.value ],
						};
					},
				} );
			} );

			test( 'should return undefined state when SERIALIZE action type passed', () => {
				expect( reducer( currentState, actionSerialize ) ).toBeUndefined();
			} );

			test( 'should return default {} state when DESERIALIZE action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).toBe( initialState );
			} );

			test( 'should add new value to test array when acc action passed', () => {
				const addAction = {
					type: TEST_ADD,
					value: 'four',
				};

				const newState = reducer( currentState, addAction );

				expect( newState ).not.toBe( currentState );
				expect( newState ).toEqual( {
					test: [ 'one', 'two', 'three', 'four' ],
				} );
			} );
		} );

		describe( 'with schema provided', () => {
			const initialState = {};

			beforeAll( () => {
				reducer = createReducer( initialState, {}, testSchema );
			} );

			test( 'should return current state when serialize action type passed', () => {
				expect( reducer( currentState, actionSerialize ) ).toBe( currentState );
				expect( reducer( currentState, actionSerialize ) ).toEqual( currentState );
			} );

			test( 'should return initial state when valid initial state and deserialize action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).toBe( currentState );
				expect( reducer( currentState, actionDeserialize ) ).toEqual( currentState );
			} );

			test( 'should return default state when invalid initial state and deserialize action type passed', () => {
				expect( reducer( { invalid: 'state' }, actionDeserialize ) ).toBe( initialState );
				expect( reducer( { invalid: 'state' }, actionDeserialize ) ).toEqual( initialState );
			} );
		} );

		describe( 'with default actions overrides', () => {
			const overriddenState = { overridden: 'state' };

			beforeAll( () => {
				reducer = createReducer( null, {
					[ SERIALIZE ]: () => overriddenState,
					[ DESERIALIZE ]: () => overriddenState,
				} );
			} );

			test( 'should return overridden state when serialize action type passed', () => {
				expect( reducer( currentState, actionSerialize ) ).toBe( overriddenState );
				expect( reducer( currentState, actionSerialize ) ).toEqual( overriddenState );
			} );

			test( 'should return overridden state when deserialize action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).toBe( overriddenState );
				expect( reducer( currentState, actionDeserialize ) ).toEqual( overriddenState );
			} );
		} );
	} );
	describe( '#keyedReducer', () => {
		const grow = name => ( { type: 'GROW', name } );
		const reset = name => ( { type: 'RESET', name } );
		const remove = name => ( { type: 'REMOVE', name } );

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

		test( 'should apply global actions to every item', () => {
			const counter = ( state = 0, { type } ) => {
				switch ( type ) {
					case 'INC':
					case 'INC_ALL':
						return state + 1;
					default:
						return state;
				}
			};

			const keyed = keyedReducer( 'id', counter, [ 'INC_ALL' ] );

			const prev = { 14: 5, 23: 19 };

			expect( keyed( prev, { type: 'INC', id: 14 } ) ).toEqual( { 14: 6, 23: 19 } );
			expect( keyed( prev, { type: 'INC_ALL' } ) ).toEqual( { 14: 6, 23: 20 } );
		} );

		test( 'should have SERIALIZE and DESERIALIZE as default global actions', () => {
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
			expect( keyed( prev, { type: 'SERIALIZE' } ) ).toEqual( { 1: 'serialized chicken' } );
			expect( keyed( prev, { type: 'DESERIALIZE' } ) ).toEqual( { 1: 'deserialized chicken' } );
		} );

		test( 'should not apply global actions if not whitelisted', () => {
			const counter = ( state = 0, { type } ) => {
				switch ( type ) {
					case 'INC':
						return state + 1;
					case 'DESERIALIZE':
						return parseInt( state, 16 );
					case 'SERIALIZE':
						return state.toString( 16 );
					default:
						return state;
				}
			};

			const keyed = keyedReducer( 'id', counter, [] );

			const prev = { 14: 5, 23: 19 };

			expect( keyed( prev, { type: 'INC', id: 14 } ) ).toEqual( { 14: 6, 23: 19 } );
			expect( keyed( prev, { type: 'SERIALIZE' } ) ).toBe( prev );
			expect( keyed( prev, { type: 'DESERIALIZE' } ) ).toBe( prev );
		} );

		test( 'should prune items after global actions are applied', () => {
			const counter = ( state = 0, { type } ) => {
				switch ( type ) {
					case 'INC':
						return state + 1;
					case 'PURGE':
						return state <= 10 ? state : undefined;
					default:
						return state;
				}
			};

			const keyed = keyedReducer( 'id', counter, [ 'PURGE' ] );

			const prev = { 14: 5, 23: 19 };

			expect( keyed( prev, { type: 'PURGE' } ) ).toEqual( { 14: 5 } );
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

		const age = ( state = 0, action ) => ( 'GROW' === action.type ? state + 1 : state );

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

		const age = ( state = 0, action ) => ( 'GROW' === action.type ? state + 1 : state );
		age.schema = schema;

		const height = ( state = 160, action ) => ( 'GROW' === action.type ? state + 1 : state );
		const count = ( state = 1, action ) => ( 'GROW' === action.type ? state + 1 : state );

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
			expect( state ).toEqual( { age: 20 } );
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
			expect( missingPerson ).toEqual( { date: 100 } );
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
			expect( valid ).toEqual( { person: { age: 22, date: 224 } } );

			const invalid = nested( { person: { age: -5, height: 100, date: new Date( -500 ) } }, write );
			expect( invalid ).toEqual( { person: { age: -5, date: -500 } } );
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
			expect( stored ).toEqual( { age: 40 } );
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
			expect( valid ).toEqual( { bob: { person: { age: 22, date: 234 } } } );

			const invalid = veryNested(
				{ bob: { person: { age: -5, height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
			expect( invalid ).toEqual( { bob: { person: { age: -5, date: -5 } } } );
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
			expect( valid ).toEqual( { bob: { person: { date: 234 } } } );

			const invalid = veryNested(
				{ bob: { person: { height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
			expect( invalid ).toEqual( { bob: { person: { date: -5 } } } );
		} );

		test( 'uses the provided validation from withSchemaValidation', () => {
			reducers = combineReducers( {
				height: withSchemaValidation( schema, height ),
				count,
			} );

			const valid = reducers( { height: 22, count: 44 }, write );
			expect( valid ).toEqual( { height: 22 } );

			const invalid = reducers( { height: -1, count: 44 }, load );
			expect( invalid ).toEqual( { height: 160, count: 1 } );
		} );

		test( 'uses the provided validation from createReducer', () => {
			reducers = combineReducers( {
				height: createReducer( 160, {}, schema ),
				count,
			} );

			const valid = reducers( { height: 22, count: 44 }, write );
			expect( valid ).toEqual( { height: 22 } );

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

	describe( '#cachingActionCreatorFactory', () => {
		let dispatch;
		let successfulWorker;
		let failingWorker;
		let loadingActionCreator;
		let successActionCreator;
		let failureActionCreator;

		let connectedLoadingActionCreator;
		let connectedSuccessActionCreator;
		let connectedFailureActionCreator;

		beforeEach( () => {
			dispatch = jest.fn( identity => identity );
			successfulWorker = jest.fn( () => Promise.resolve( 'success_data' ) );
			failingWorker = jest.fn( () => Promise.reject( 'error_data' ) );

			loadingActionCreator = jest.fn( () => dispatch( { type: 'loading' } ) );
			successActionCreator = jest.fn( () => dispatch( { type: 'success' } ) );
			failureActionCreator = jest.fn( () => dispatch( { type: 'failure' } ) );

			connectedLoadingActionCreator = () => loadingActionCreator;
			connectedSuccessActionCreator = () => successActionCreator;
			connectedFailureActionCreator = () => failureActionCreator;
		} );

		test( 'should call apropriate action creators on success', async () => {
			const actionCreator = cachingActionCreatorFactory(
				successfulWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			await actionCreator( 123 )( dispatch );
			expect( loadingActionCreator ).toHaveBeenCalledWith( 123 );
			expect( successActionCreator ).toHaveBeenCalledWith( 'success_data' );
			expect( failureActionCreator ).not.toHaveBeenCalledWith();
		} );

		test( 'should call apropriate action creators on failure', async () => {
			const actionCreator = cachingActionCreatorFactory(
				failingWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			await actionCreator( 123 )( dispatch );
			expect( loadingActionCreator ).toHaveBeenCalledWith( 123 );
			expect( failureActionCreator ).toHaveBeenCalledWith( 'error_data' );
			expect( successActionCreator ).not.toHaveBeenCalled();
		} );

		test( 'should cache same parameters successful call', async () => {
			const actionCreator = cachingActionCreatorFactory(
				successfulWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			const callActionCreator = () => actionCreator( 123 )( dispatch );

			await callActionCreator();
			await callActionCreator();

			expect( successfulWorker ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should not cache same parameters failed call', async () => {
			const actionCreator = cachingActionCreatorFactory(
				failingWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			const callActionCreator = () => actionCreator( 123 )( dispatch );

			await callActionCreator();
			await callActionCreator();

			expect( failingWorker ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( '#withEnhancers', () => {
		it( 'should enhance action creator', () => {
			const actionCreator = () => ( { type: 'HELLO' } );
			const enhancedActionCreator = withEnhancers( actionCreator, action =>
				Object.assign( { name: 'test' }, action )
			);
			const thunk = enhancedActionCreator();
			const getState = () => ( {} );
			let dispatchedAction = null;
			const dispatch = action => ( dispatchedAction = action );
			thunk( dispatch, getState );

			expect( dispatchedAction ).toEqual( {
				name: 'test',
				type: 'HELLO',
			} );
		} );

		it( 'should enhance with multiple enhancers, from last to first', () => {
			const actionCreator = () => ( { type: 'HELLO' } );
			const enhancedActionCreator = withEnhancers( actionCreator, [
				action => Object.assign( { name: 'test' }, action ),
				action => Object.assign( { name: 'test!!!' }, action ),
				action => Object.assign( { meetup: 'akumal' }, action ),
			] );
			const thunk = enhancedActionCreator();
			const getState = () => ( {} );
			let dispatchedAction = null;
			const dispatch = action => ( dispatchedAction = action );
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
			const dispatch = action => action;
			thunk( dispatch, getState );

			expect( providedGetState ).toEqual( getState );
		} );

		it( 'should accept an action creator as first parameter', () => {
			const actionCreator = () => ( { type: 'HELLO' } );
			const enhancedActionCreator = withEnhancers(
				withEnhancers( actionCreator, action => Object.assign( { name: 'test' }, action ) ),
				action => Object.assign( { hello: 'world' }, action )
			);

			const thunk = enhancedActionCreator();
			const getState = () => ( {} );
			let dispatchedAction = null;
			const dispatch = action => ( dispatchedAction = action );
			thunk( dispatch, getState );

			expect( dispatchedAction ).toEqual( {
				name: 'test',
				hello: 'world',
				type: 'HELLO',
			} );
		} );
	} );
} );
