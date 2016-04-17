/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import noop from 'lodash/noop';

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
	const initialState = deepFreeze( {
			test: [ 'one', 'two', 'three' ]
		} ),
		actionSerialize = { type: SERIALIZE },
		actionDeserialize = { type: DESERIALIZE };
	let createReducer, reducer;

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/warn', noop );

		createReducer = require( 'state/utils' ).createReducer;
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
					reducer( initialState, invalidAction )
				).to.be.deep.equal( initialState );
			} );

			it( 'should return initial state when unknown action type passed', () => {
				const unknownAction = {
					type: 'UNKNOWN'
				};

				expect(
					reducer( initialState, unknownAction )
				).to.be.deep.equal( initialState );
			} );

			it( 'should return default null state when serialize action type passed', () => {
				expect(
					reducer( initialState, actionSerialize )
				).to.be.null;
			} );

			it( 'should return default null state when deserialize action type passed', () => {
				expect(
					reducer( initialState, actionDeserialize )
				).to.be.null;
			} );
		} );

		context( 'with reducers and default state provided', () => {
			const defaultState = {},
				TEST_ADD = 'TEST_ADD';

			before( () => {
				reducer = createReducer( {
					[TEST_ADD]: ( state, action ) => {
						return {
							test: [ ...state.test, action.value ]
						};
					}
				}, defaultState );
			} );

			it( 'should return default {} state when SERIALIZE action type passed', () => {
				expect(
					reducer( initialState, actionSerialize )
				).to.be.equal( defaultState );
			} );

			it( 'should return default {} state when DESERIALIZE action type passed', () => {
				expect(
					reducer( initialState, actionDeserialize )
				).to.be.equal( defaultState );
			} );

			it( 'should add new value to test array when acc action passed', () => {
				const addAction = {
					type: TEST_ADD,
					value: 'four'
				};

				const newState = reducer( initialState, addAction );

				expect( newState ).to.not.equal( initialState );
				expect( newState ).to.be.eql( {
					test: [ 'one', 'two', 'three', 'four' ]
				} );
			} );
		} );

		context( 'with schema provided', () => {
			const defaultState = {};

			before( () => {
				reducer = createReducer( {}, defaultState, testSchema );
			} );

			it( 'should return initial state when serialize action type passed', () => {
				expect(
					reducer( initialState, actionSerialize )
				).to.be.deep.equal( initialState );
			} );

			it( 'should return initial state when valid initial state and deserialize action type passed', () => {
				expect(
					reducer( initialState, actionDeserialize )
				).to.be.deep.equal( initialState );
			} );

			it( 'should return default state when invalid initial state and deserialize action type passed', () => {
				expect(
					reducer( { invalid: 'state' }, actionDeserialize )
				).to.be.deep.equal( defaultState );
			} );
		} );

		context( 'with default actions overrides', () => {
			const overriddenState = { overridden: 'state' };

			before( () => {
				reducer = createReducer( {
					[SERIALIZE]: state => overriddenState,
					[DESERIALIZE]: state => overriddenState
				} );
			} );

			it( 'should return overridden state when serialize action type passed', () => {
				expect(
					reducer( initialState, actionSerialize )
				).to.be.deep.equal( overriddenState );
			} );

			it( 'should return overridden state when deserialize action type passed', () => {
				expect(
					reducer( initialState, actionDeserialize )
				).to.be.deep.equal( overriddenState );
			} );
		} );
	} );
} );
