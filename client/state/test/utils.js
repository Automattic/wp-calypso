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
	let extendAction, createReducer, reducer;

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/warn', noop );

		( { extendAction, createReducer } = require( 'state/utils' ) );
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
} );
