/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { stub, spy } from 'sinon';

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
} from 'state/utils';
jest.mock( 'lib/warn', () => () => {} );

describe( 'utils', () => {
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

			expect( action ).to.eql( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true,
				},
			} );
		} );

		test( 'should return an updated action thunk, merging data on dispatch', () => {
			const dispatch = spy();
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
			expect( dispatch ).to.have.been.calledWithExactly( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true,
				},
			} );
		} );

		test( 'should return an updated nested action thunk, merging data on dispatch', () => {
			const dispatch = spy();
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
			dispatch.getCall( 0 ).args[ 0 ]( dispatch );
			expect( dispatch ).to.have.been.calledWithExactly( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true,
				},
			} );
		} );
	} );

	describe( '#createReducer()', () => {
		describe( 'only default behavior', () => {
			beforeAll( () => {
				reducer = createReducer();
			} );

			test( 'should return a function', () => {
				expect( reducer ).to.be.a.function;
			} );

			test( 'should return initial state when invalid action passed', () => {
				const invalidAction = {};

				expect( reducer( currentState, invalidAction ) ).to.be.deep.equal( currentState );
			} );

			test( 'should return initial state when unknown action type passed', () => {
				const unknownAction = {
					type: 'UNKNOWN',
				};

				expect( reducer( currentState, unknownAction ) ).to.be.deep.equal( currentState );
			} );

			test( 'should return default null state when serialize action type passed', () => {
				expect( reducer( currentState, actionSerialize ) ).to.be.null;
			} );

			test( 'should return default null state when deserialize action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).to.be.null;
			} );

			test( 'should throw an error when passed an undefined type', () => {
				expect( () => reducer( undefined, { type: undefined } ) ).to.throw;
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

			test( 'should return default {} state when SERIALIZE action type passed', () => {
				expect( reducer( currentState, actionSerialize ) ).to.be.equal( initialState );
			} );

			test( 'should return default {} state when DESERIALIZE action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).to.be.equal( initialState );
			} );

			test( 'should add new value to test array when acc action passed', () => {
				const addAction = {
					type: TEST_ADD,
					value: 'four',
				};

				const newState = reducer( currentState, addAction );

				expect( newState ).to.not.equal( currentState );
				expect( newState ).to.be.eql( {
					test: [ 'one', 'two', 'three', 'four' ],
				} );
			} );
		} );

		describe( 'with schema provided', () => {
			const initialState = {};

			beforeAll( () => {
				reducer = createReducer( initialState, {}, testSchema );
			} );

			test( 'should return initial state when serialize action type passed', () => {
				expect( reducer( currentState, actionSerialize ) ).to.be.deep.equal( currentState );
			} );

			test( 'should return initial state when valid initial state and deserialize action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).to.be.deep.equal( currentState );
			} );

			test( 'should return default state when invalid initial state and deserialize action type passed', () => {
				expect( reducer( { invalid: 'state' }, actionDeserialize ) ).to.be.deep.equal(
					initialState
				);
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
				expect( reducer( currentState, actionSerialize ) ).to.be.deep.equal( overriddenState );
			} );

			test( 'should return overridden state when deserialize action type passed', () => {
				expect( reducer( currentState, actionDeserialize ) ).to.be.deep.equal( overriddenState );
			} );
		} );

		test( 'should cache the serialize result on custom serialization behavior', () => {
			const monitor = stub().returnsArg( 0 );

			reducer = createReducer(
				[],
				{
					[ SERIALIZE ]: monitor,
					TEST_ADD: state => [ ...state, state.length ],
				},
				testSchema
			);

			let state;
			state = reducer( state, { type: SERIALIZE } );
			state = reducer( state, { type: SERIALIZE } );
			state = reducer( state, { type: 'TEST_ADD' } );
			state = reducer( state, { type: SERIALIZE } );
			state = reducer( state, { type: SERIALIZE } );
			state = reducer( state, { type: 'TEST_ADD' } );
			state = reducer( state, { type: SERIALIZE } );

			expect( monitor ).to.have.been.calledThrice;
			expect( state ).to.eql( [ 0, 1 ] );
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
			expect( () => keyedReducer( null, age ) ).to.throw( TypeError );
			expect( () => keyedReducer( undefined, age ) ).to.throw( TypeError );
			expect( () => keyedReducer( [], age ) ).to.throw( TypeError );
			expect( () => keyedReducer( {}, age ) ).to.throw( TypeError );
			expect( () => keyedReducer( true, age ) ).to.throw( TypeError );
			expect( () => keyedReducer( 10, age ) ).to.throw( TypeError );
			expect( () => keyedReducer( 15.4, age ) ).to.throw( TypeError );
			expect( () => keyedReducer( '', age ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', age ) ).to.not.throw( TypeError );
		} );

		test( 'should only accept a function as the reducer argument', () => {
			expect( () => keyedReducer( 'key', null ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', undefined ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', [] ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', {} ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', true ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', 10 ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', 15.4 ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', '' ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key' ) ).to.throw( TypeError );
			expect( () => keyedReducer( 'key', () => {} ).to.not.throw( TypeError ) );
		} );

		test( 'should create keyed state given simple reducers', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( undefined, grow( 'Calypso' ) ) ).to.eql( {
				Calypso: 1,
			} );
		} );

		test( 'should handle keyNames referencing nested keys', () => {
			const keyed = keyedReducer( 'person.name', age );
			const action = { type: 'GROW', person: { name: 'Calypso' } };
			expect( keyed( undefined, action ) ).to.eql( {
				Calypso: 1,
			} );
		} );

		test( 'should only affect the keyed item in a collection', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, grow( 'Calypso' ) ) ).to.eql( {
				Bonobo: 13,
				Calypso: 1,
			} );
		} );

		test( 'should skip if no key is provided in the action', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'GROW' } ) ).to.equal( prevState );
		} );

		test( 'should handle falsey keys', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { [ 0 ]: 10 }, grow( 0 ) ) ).to.eql( { '0': 11 } );
		} );

		test( 'should handle coerced-to-string keys', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { '10': 10 }, grow( '10' ) ) ).to.eql( { '10': 11 } );
			expect( keyed( { [ 10 ]: 10 }, grow( '10' ) ) ).to.eql( { '10': 11 } );
			expect( keyed( { [ 10 ]: 10 }, grow( 10 ) ) ).to.eql( { '10': 11 } );
			expect( keyed( { '10': 10 }, grow( 10 ) ) ).to.eql( { '10': 11 } );
		} );

		test( 'should return without changes if no actual changes occur', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'STAY', name: 'Bonobo' } ) ).to.equal( prevState );
		} );

		test( 'should not initialize a state if no changes and not keyed (simple state)', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'STAY', name: 'Calypso' } ) ).to.equal( prevState );
		} );

		test( 'should remove keys if set back to initialState', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { 10: 10 }, reset( '10' ) ) ).to.eql( {} );
		} );

		test( 'should remove keys if set to undefined', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { 10: 10 }, remove( '10' ) ) ).to.eql( {} );
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

			expect( keyed( prev, { type: 'INC', id: 14 } ) ).to.eql( { 14: 6, 23: 19 } );
			expect( keyed( prev, { type: 'INC_ALL' } ) ).to.eql( { 14: 6, 23: 20 } );
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

			expect( keyed( prev, { type: 'SET_CHICKEN', id: 2 } ) ).to.eql( {
				1: 'chicken',
				2: 'chicken',
			} );
			expect( keyed( prev, { type: 'SERIALIZE' } ) ).to.eql( { 1: 'serialized chicken' } );
			expect( keyed( prev, { type: 'DESERIALIZE' } ) ).to.eql( { 1: 'deserialized chicken' } );
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

			expect( keyed( prev, { type: 'INC', id: 14 } ) ).to.eql( { 14: 6, 23: 19 } );
			expect( keyed( prev, { type: 'SERIALIZE' } ) ).to.equal( prev );
			expect( keyed( prev, { type: 'DESERIALIZE' } ) ).to.equal( prev );
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

			expect( keyed( prev, { type: 'PURGE' } ) ).to.eql( { 14: 5 } );
		} );
	} );

	describe( '#withSchemaValidation', () => {
		const load = { type: DESERIALIZE };
		const write = { type: SERIALIZE };
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

		test( 'should return initial state without a schema on SERIALIZE', () => {
			const validated = withSchemaValidation( null, age );
			expect( validated( 5, write ) ).to.equal( 0 );
		} );

		test( 'should return initial state without a schema on DESERIALIZE', () => {
			const validated = withSchemaValidation( null, age );
			expect( validated( 5, load ) ).to.equal( 0 );
		} );

		test( 'should invalidate DESERIALIZED state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( -5, load ) ).to.equal( 0 );
		} );

		test( 'should not invalidate normal state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( -5, normal ) ).to.equal( -5 );
		} );

		test( 'should validate initial state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( 5, load ) ).to.equal( 5 );
		} );

		test( 'actions work as expected with schema', () => {
			const validated = withSchemaValidation( schema, age );
			expect( validated( 5, grow ) ).to.equal( 6 );
		} );

		test( 'actions work as expected without schema', () => {
			const validated = withSchemaValidation( null, age );
			expect( validated( 5, grow ) ).to.equal( 6 );
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
			const state = reducers( undefined, write );
			expect( state ).to.eql( { age: 0, height: 160 } );
		} );

		test( 'should not persist height, because it is missing a schema', () => {
			const state = reducers( appState, write );
			expect( state ).to.eql( { age: 20, height: 160 } );
		} );

		test( 'should not load height, because it is missing a schema', () => {
			const state = reducers( appState, load );
			expect( state ).to.eql( { age: 20, height: 160 } );
		} );

		test( 'should validate age', () => {
			const state = reducers( { age: -5 }, load );
			expect( state ).to.eql( { age: 0, height: 160 } );
		} );

		test( 'actions work as expected', () => {
			const state = reducers( appState, grow );
			expect( state ).to.eql( { age: 21, height: 172 } );
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
			expect( valid ).to.eql( {
				person: { age: 22, height: 160, date: new Date( 224 ) },
				count: 1,
			} );

			const invalid = nested( { person: { age: -5, height: 100, date: -5 } }, load );
			expect( invalid ).to.eql( {
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
			expect( valid ).to.eql( { person: { age: 22, height: 160, date: 224 }, count: 1 } );

			const invalid = nested( { person: { age: -5, height: 100, date: new Date( -500 ) } }, write );
			expect( invalid ).to.eql( { person: { age: -5, height: 160, date: -500 }, count: 1 } );
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
			expect( valid ).to.eql( {
				bob: { person: { age: 22, height: 160, date: new Date( 224 ) } },
				count: 1,
			} );

			const invalid = veryNested(
				{ bob: { person: { age: -5, height: 22, date: -500 } }, count: 123 },
				load
			);
			expect( invalid ).to.eql( {
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
			expect( valid ).to.eql( { bob: { person: { age: 22, height: 160, date: 234 } }, count: 1 } );

			const invalid = veryNested(
				{ bob: { person: { age: -5, height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
			expect( invalid ).to.eql( { bob: { person: { age: -5, height: 160, date: -5 } }, count: 1 } );
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
			expect( valid ).to.eql( { bob: { person: { height: 160, date: 234 } }, count: 1 } );

			const invalid = veryNested(
				{ bob: { person: { height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
			expect( invalid ).to.eql( { bob: { person: { height: 160, date: -5 } }, count: 1 } );
		} );

		test( 'uses the provided validation from withSchemaValidation', () => {
			reducers = combineReducers( {
				height: withSchemaValidation( schema, height ),
				count,
			} );

			const valid = reducers( { height: 22, count: 44 }, write );
			expect( valid ).to.eql( { height: 22, count: 1 } );

			const invalid = reducers( { height: -1, count: 44 }, load );
			expect( invalid ).to.eql( { height: 160, count: 1 } );
		} );

		test( 'uses the provided validation from createReducer', () => {
			reducers = combineReducers( {
				height: createReducer( 160, {}, schema ),
				count,
			} );

			const valid = reducers( { height: 22, count: 44 }, write );
			expect( valid ).to.eql( { height: 22, count: 1 } );

			const invalid = reducers( { height: -1, count: 44 }, load );
			expect( invalid ).to.eql( { height: 160, count: 1 } );
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
			expect( wrapped( 10, { type: 'GROW' } ) ).to.equal( 11 );
			expect( wrapped( 10, { type: 'FADE' } ) ).to.equal( 10 );
		} );

		test( 'should DESERIALIZE to `initialState`', () => {
			expect( wrapped( 10, { type: DESERIALIZE } ) ).to.equal( 0 );
		} );

		test( 'should SERIALIZE to `null`', () => {
			expect( wrapped( 10, { type: SERIALIZE } ) ).to.be.null;
		} );
	} );

	describe( '#cachingActionCreatorFactory', () => {
		let passThrough;
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
			passThrough = pass => pass;

			dispatch = spy( passThrough );
			successfulWorker = spy( () => Promise.resolve( 'success_data' ) );
			failingWorker = spy( () => Promise.reject( 'error_data' ) );

			loadingActionCreator = spy( () => dispatch( { type: 'loading' } ) );
			successActionCreator = spy( () => dispatch( { type: 'success' } ) );
			failureActionCreator = spy( () => dispatch( { type: 'failure' } ) );

			connectedLoadingActionCreator = () => loadingActionCreator;
			connectedSuccessActionCreator = () => successActionCreator;
			connectedFailureActionCreator = () => failureActionCreator;
		} );

		test( 'should call apropriate action creators on success', () => {
			const actionCreator = cachingActionCreatorFactory(
				successfulWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			const dispatchResult = actionCreator( 123 )( dispatch );
			expect( loadingActionCreator ).to.be.calledWith( 123 );

			return dispatchResult.then( () => {
				expect( successActionCreator ).to.be.calledWith( 'success_data' );
				expect( failureActionCreator ).not.to.be.called;
			} );
		} );

		test( 'should call apropriate action creators on failure', () => {
			const actionCreator = cachingActionCreatorFactory(
				failingWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			const dispatchResult = actionCreator( 123 )( dispatch );
			expect( loadingActionCreator ).to.be.calledWith( 123 );

			return dispatchResult.then( () => {
				expect( failureActionCreator ).to.be.calledWith( 'error_data' );
				expect( successActionCreator ).not.to.be.called;
			} );
		} );

		test( 'should cache same parameters successful call', () => {
			const actionCreator = cachingActionCreatorFactory(
				successfulWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			const firstCall = actionCreator( 123 )( dispatch );
			const secondCall = firstCall.then( () => actionCreator( 123 )( dispatch ) );

			return secondCall.then( () => expect( successfulWorker ).to.be.calledOnce );
		} );

		test( 'should not cache same parameters failed call', () => {
			const actionCreator = cachingActionCreatorFactory(
				failingWorker,
				connectedLoadingActionCreator,
				connectedSuccessActionCreator,
				connectedFailureActionCreator
			);

			const callActionCreator = () => actionCreator( 123 )( dispatch );

			const firstCall = callActionCreator();
			const secondCall = firstCall.then( callActionCreator, callActionCreator );

			return Promise.all( [ firstCall, secondCall ] ).then(
				() => expect( failingWorker ).to.be.calledTwice
			);
		} );
	} );
} );
