/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import noop from 'lodash/noop';
import { stub, spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';
import { testSchema } from './mocks/schema';
import useMockery from 'test/helpers/use-mockery';

describe( 'utils', () => {
	const currentState = deepFreeze( {
			test: [ 'one', 'two', 'three' ]
		} ),
		actionSerialize = { type: SERIALIZE },
		actionDeserialize = { type: DESERIALIZE };
	let createReducer;
	let extendAction;
	let keyedReducer;
	let reducer;
	let withSchemaValidation;
	let combineReducersWithPersistence;

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/warn', noop );

		( {
			createReducer,
			extendAction,
			keyedReducer,
			withSchemaValidation,
			combineReducersWithPersistence,
		} = require( 'state/utils' ) );
	} );

	describe( 'extendAction()', () => {
		it( 'should return an updated action object, merging data', () => {
			const action = extendAction( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true
				}
			}, {
				meta: {
					ok: true
				}
			} );

			expect( action ).to.eql( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true
				}
			} );
		} );

		it( 'should return an updated action thunk, merging data on dispatch', () => {
			const dispatch = spy();
			const action = extendAction(
				( thunkDispatch ) => thunkDispatch( {
					type: 'ACTION_TEST',
					meta: {
						preserve: true
					}
				} ),
				{
					meta: {
						ok: true
					}
				}
			);

			action( dispatch );
			expect( dispatch ).to.have.been.calledWithExactly( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true
				}
			} );
		} );

		it( 'should return an updated nested action thunk, merging data on dispatch', () => {
			const dispatch = spy();
			const action = extendAction(
				( thunkDispatch ) => thunkDispatch(
					( nestedThunkDispatch ) => nestedThunkDispatch( {
						type: 'ACTION_TEST',
						meta: {
							preserve: true
						}
					} )
				),
				{
					meta: {
						ok: true
					}
				}
			);

			action( dispatch );
			dispatch.getCall( 0 ).args[ 0 ]( dispatch );
			expect( dispatch ).to.have.been.calledWithExactly( {
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
					ok: true
				}
			} );
		} );
	} );

	describe( '#createReducer()', () => {
		context( 'only default behavior', () => {
			before( () => {
				reducer = createReducer();
			} );

			it( 'should return a function', () => {
				expect( reducer ).to.be.a.function;
			} );

			it( 'should return initial state when invalid action passed', () => {
				const invalidAction = {};

				expect(
					reducer( currentState, invalidAction )
				).to.be.deep.equal( currentState );
			} );

			it( 'should return initial state when unknown action type passed', () => {
				const unknownAction = {
					type: 'UNKNOWN'
				};

				expect(
					reducer( currentState, unknownAction )
				).to.be.deep.equal( currentState );
			} );

			it( 'should return default null state when serialize action type passed', () => {
				expect(
					reducer( currentState, actionSerialize )
				).to.be.null;
			} );

			it( 'should return default null state when deserialize action type passed', () => {
				expect(
					reducer( currentState, actionDeserialize )
				).to.be.null;
			} );

			it( 'should throw an error when passed an undefined type', () => {
				expect( () => reducer( undefined, { type: undefined } ) ).to.throw;
			} );
		} );

		context( 'with reducers and default state provided', () => {
			const initialState = {},
				TEST_ADD = 'TEST_ADD';

			before( () => {
				reducer = createReducer( initialState, {
					[ TEST_ADD ]: ( state, action ) => {
						return {
							test: [ ...state.test, action.value ]
						};
					}
				} );
			} );

			it( 'should return default {} state when SERIALIZE action type passed', () => {
				expect(
					reducer( currentState, actionSerialize )
				).to.be.equal( initialState );
			} );

			it( 'should return default {} state when DESERIALIZE action type passed', () => {
				expect(
					reducer( currentState, actionDeserialize )
				).to.be.equal( initialState );
			} );

			it( 'should add new value to test array when acc action passed', () => {
				const addAction = {
					type: TEST_ADD,
					value: 'four'
				};

				const newState = reducer( currentState, addAction );

				expect( newState ).to.not.equal( currentState );
				expect( newState ).to.be.eql( {
					test: [ 'one', 'two', 'three', 'four' ]
				} );
			} );
		} );

		context( 'with schema provided', () => {
			const initialState = {};

			before( () => {
				reducer = createReducer( initialState, {}, testSchema );
			} );

			it( 'should return initial state when serialize action type passed', () => {
				expect(
					reducer( currentState, actionSerialize )
				).to.be.deep.equal( currentState );
			} );

			it( 'should return initial state when valid initial state and deserialize action type passed', () => {
				expect(
					reducer( currentState, actionDeserialize )
				).to.be.deep.equal( currentState );
			} );

			it( 'should return default state when invalid initial state and deserialize action type passed', () => {
				expect(
					reducer( { invalid: 'state' }, actionDeserialize )
				).to.be.deep.equal( initialState );
			} );
		} );

		context( 'with default actions overrides', () => {
			const overriddenState = { overridden: 'state' };

			before( () => {
				reducer = createReducer( null, {
					[ SERIALIZE ]: () => overriddenState,
					[ DESERIALIZE ]: () => overriddenState
				} );
			} );

			it( 'should return overridden state when serialize action type passed', () => {
				expect(
					reducer( currentState, actionSerialize )
				).to.be.deep.equal( overriddenState );
			} );

			it( 'should return overridden state when deserialize action type passed', () => {
				expect(
					reducer( currentState, actionDeserialize )
				).to.be.deep.equal( overriddenState );
			} );
		} );

		it( 'should cache the serialize result on custom serialization behavior', () => {
			const monitor = stub().returnsArg( 0 );

			reducer = createReducer( [], {
				[ SERIALIZE ]: monitor,
				TEST_ADD: ( state ) => [ ...state, state.length ]
			}, testSchema );

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

		const age = ( state = 0, action ) =>
			'GROW' === action.type
				? state + 1
				: state;

		const prevState = deepFreeze( {
			Bonobo: 13,
		} );

		it( 'should only accept string-type key names', () => {
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

		it( 'should only accept a function as the reducer argument', () => {
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

		it( 'should create keyed state given simple reducers', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( undefined, grow( 'Calypso' ) ) ).to.eql( {
				Calypso: 1
			} );
		} );

		it( 'should only affect the keyed item in a collection', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, grow( 'Calypso' ) ) ).to.eql( {
				Bonobo: 13,
				Calypso: 1,
			} );
		} );

		it( 'should skip if no key is provided in the action', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'GROW' } ) ).to.equal( prevState );
		} );

		it( 'should handle falsey keys', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { [ 0 ]: 10 }, grow( 0 ) ) ).to.eql( { '0': 11 } );
		} );

		it( 'should handle coerced-to-string keys', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( { '10': 10 }, grow( '10' ) ) ).to.eql( { '10': 11 } );
			expect( keyed( { [ 10 ]: 10 }, grow( '10' ) ) ).to.eql( { '10': 11 } );
			expect( keyed( { [ 10 ]: 10 }, grow( 10 ) ) ).to.eql( { '10': 11 } );
			expect( keyed( { '10': 10 }, grow( 10 ) ) ).to.eql( { '10': 11 } );
		} );

		it( 'should return without changes if no actual changes occur', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'STAY', name: 'Bonobo' } ) ).to.equal( prevState );
		} );

		it( 'should not initialize a state if no changes and not keyed (simple state)', () => {
			const keyed = keyedReducer( 'name', age );
			expect( keyed( prevState, { type: 'STAY', name: 'Calypso' } ) ).to.equal( prevState );
		} );
	} );

	describe( '#withSchemaValidation', () => {
		const load = { type: DESERIALIZE };
		const write = { type: SERIALIZE };
		const normal = { type: 'NORMAL' };
		const schema = {
			type: 'number',
			minimum: 0,
		};

		const age = ( state = 0, action ) =>
			'GROW' === action.type
				? state + 1
				: state;

		it( 'should return initial state without a schema on SERIALIZE', () => {
			const validated = withSchemaValidation( null, age );
			expect( validated( 5, write ) ).to.equal( 0 );
		} );

		it( 'should return initial state without a schema on DESERIALIZE', () => {
			const validated = withSchemaValidation( null, age );
			expect( validated( 5, load ) ).to.equal( 0 );
		} );

		it( 'should invalidate DESERIALIZED state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( -5, load ) ).to.equal( 0 );
		} );

		it( 'should not invalidate normal state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( -5, normal ) ).to.equal( -5 );
		} );

		it( 'should validate initial state', () => {
			const validated = withSchemaValidation( schema, age );

			expect( validated( 5, load ) ).to.equal( 5 );
		} );

		it( 'actions work as expected with schema', () => {
			const validated = withSchemaValidation( schema, age );
			expect( validated( 5, { type: 'GROW' } ) ).to.equal( 6 );
		} );

		it( 'actions work as expected without schema', () => {
			const validated = withSchemaValidation( null, age );
			expect( validated( 5, { type: 'GROW' } ) ).to.equal( 6 );
		} );
	} );

	describe( '#combineReducersWithPersistence', () => {
		const load = { type: DESERIALIZE };
		const write = { type: SERIALIZE };
		const grow = { type: 'GROW' };
		const schema = {
			type: 'number',
			minimum: 0,
		};

		const age = ( state = 0, action ) =>
			'GROW' === action.type
				? state + 1
				: state;
		age.schema = schema;

		const height = ( state = 160, action ) =>
			'GROW' === action.type
				? state + 1
				: state;
		const count = ( state = 1, action ) =>
			'GROW' === action.type
				? state + 1
				: state;

		let reducers;

		beforeEach( () => {
			reducers = combineReducersWithPersistence( {
				age,
				height
			} );
		} );

		const appState = deepFreeze( {
			age: 20,
			height: 171
		} );

		it( 'should return initial state on init', () => {
			const state = reducers( undefined, write );
			expect( state ).to.eql( { age: 0, height: 160 } );
		} );

		it( 'should not persist height, because it is missing a schema', () => {
			const state = reducers( appState, write );
			expect( state ).to.eql( { age: 20, height: 160 } );
		} );

		it( 'should not load height, because it is missing a schema', () => {
			const state = reducers( appState, load );
			expect( state ).to.eql( { age: 20, height: 160 } );
		} );

		it( 'should validate age', () => {
			const state = reducers( { age: -5 }, load );
			expect( state ).to.eql( { age: 0, height: 160 } );
		} );

		it( 'actions work as expected', () => {
			const state = reducers( appState, grow );
			expect( state ).to.eql( { age: 21, height: 172 } );
		} );

		it( 'nested reducers work on load', () => {
			const nested = combineReducersWithPersistence( {
				person: reducers,
				count
			} );
			const valid = nested( { person: { age: 22 } }, load );
			expect( valid ).to.eql( { person: { age: 22, height: 160 }, count: 1 } );

			const invalid = nested( { person: { age: -5, height: 100 } }, load );
			expect( invalid ).to.eql( { person: { age: 0, height: 160 }, count: 1 } );
		} );

		it( 'nested reducers work on persist', () => {
			const nested = combineReducersWithPersistence( {
				person: reducers,
				count
			} );
			const valid = nested( { person: { age: 22 } }, write );
			expect( valid ).to.eql( { person: { age: 22, height: 160 }, count: 1 } );

			const invalid = nested( { person: { age: -5, height: 100 } }, write );
			expect( invalid ).to.eql( { person: { age: -5, height: 160 }, count: 1 } );
		} );

		it( 'deeply nested reducers work on load', () => {
			const nested = combineReducersWithPersistence( {
				person: reducers
			} );
			const veryNested = combineReducersWithPersistence( {
				bob: nested,
				count
			} );
			const valid = veryNested( { bob: { person: { age: 22 } }, count: 122 }, load );
			expect( valid ).to.eql( { bob: { person: { age: 22, height: 160 } }, count: 1 } );

			const invalid = veryNested( { bob: { person: { age: -5, height: 22 } }, count: 123 }, load );
			expect( invalid ).to.eql( { bob: { person: { age: 0, height: 160 } }, count: 1 } );
		} );

		it( 'deeply nested reducers work on persist', () => {
			const nested = combineReducersWithPersistence( {
				person: reducers
			} );
			const veryNested = combineReducersWithPersistence( {
				bob: nested,
				count
			} );
			const valid = veryNested( { bob: { person: { age: 22 } }, count: 122 }, write );
			expect( valid ).to.eql( { bob: { person: { age: 22, height: 160 } }, count: 1 } );

			const invalid = veryNested( { bob: { person: { age: -5, height: 22 } }, count: 123 }, write );
			expect( invalid ).to.eql( { bob: { person: { age: -5, height: 160 } }, count: 1 } );
		} );
	} );
} );
