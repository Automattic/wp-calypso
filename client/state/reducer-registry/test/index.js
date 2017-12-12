/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import {
	createReducer,
	combineReducers,
	withSchemaValidation,
	isValidStateWithSchema,
} from 'state/utils';
import { addReducers, combineReducersAndAddLater } from 'state/reducer-registry';
jest.mock( 'lib/warn', () => () => {} );

describe( 'reducer-registry', () => {
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

	describe( '#combineReducersAndAddLater', () => {
		let reducers;

		beforeEach( () => {
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
				},
				'test',
				Object.create( null )
			);
		} );

		const appState = deepFreeze( {
			age: 20,
			height: 171,
		} );

		const partiallyLoadedAppState = deepFreeze( {
			age: 20,
			height: {
				_initialState: 171,
			},
		} );

		test( 'should return initial state on init', () => {
			const state = reducers( undefined, write );
			expect( state ).to.eql( { age: 0, height: 160 } );
		} );

		test( 'should not persist height, because it is missing a schema', () => {
			const state = reducers( appState, write );
			expect( state ).to.eql( { age: 20, height: 160 } );
		} );

		test( 'should persist height without a loaded reducer', () => {
			reducers = combineReducersAndAddLater(
				{
					age,
				},
				'test',
				Object.create( null )
			);
			const state = reducers( partiallyLoadedAppState, write );
			expect( state ).to.eql( { age: 20, height: 171 } );
		} );

		test( 'should not load height, because it is missing a schema', () => {
			const state = reducers( appState, load );
			expect( state ).to.eql( { age: 20, height: 160 } );
		} );

		test( 'should load height into _initialState without a loaded reducer', () => {
			reducers = combineReducersAndAddLater(
				{
					age,
				},
				'test',
				Object.create( null )
			);
			const state = reducers( appState, load );
			expect( state ).to.eql( { age: 20, height: { _initialState: 171 } } );
		} );

		test( 'should work without any initial reducers', () => {
			reducers = combineReducersAndAddLater( {}, 'test', Object.create( null ) );
			const state = reducers( appState, load );
			expect( state ).to.eql( { age: { _initialState: 20 }, height: { _initialState: 171 } } );
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
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
					count,
				},
				'root',
				registry
			);
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

		test( 'nested reducers work on load when nesting a combineReducers reducer', () => {
			const registry = Object.create( null );
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
					count,
				},
				'root',
				registry
			);
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

		test( 'nested reducers work on load when being nested', () => {
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
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
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
					count,
				},
				'root',
				registry
			);
			const valid = nested( { person: { age: 22, date: new Date( 224 ) } }, write );
			expect( valid ).to.eql( { person: { age: 22, height: 160, date: 224 }, count: 1 } );

			const invalid = nested( { person: { age: -5, height: 100, date: new Date( -500 ) } }, write );
			expect( invalid ).to.eql( { person: { age: -5, height: 160, date: -500 }, count: 1 } );
		} );

		test( 'nested reducers work on persist when nesting a combineReducers reducer', () => {
			const registry = Object.create( null );
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
					count,
				},
				'root',
				registry
			);
			const valid = nested( { person: { age: 22, date: new Date( 224 ) } }, write );
			expect( valid ).to.eql( { person: { age: 22, height: 160, date: 224 }, count: 1 } );

			const invalid = nested( { person: { age: -5, height: 100, date: new Date( -500 ) } }, write );
			expect( invalid ).to.eql( { person: { age: -5, height: 160, date: -500 }, count: 1 } );
		} );

		test( 'nested reducers work on persist when being nested', () => {
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
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
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
				},
				'nested',
				registry
			);
			const veryNested = combineReducersAndAddLater(
				{
					bob: nested,
					count,
				},
				'root',
				registry
			);
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

		test( 'deeply nested reducers work on load when nesting a combineReducers reducer', () => {
			const registry = Object.create( null );
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
			} );
			const veryNested = combineReducersAndAddLater(
				{
					bob: nested,
					count,
				},
				'root',
				registry
			);
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

		test( 'deeply nested reducers work on load when being nested', () => {
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
				},
				'nested',
				registry
			);
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
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
				},
				'nested',
				registry
			);
			const veryNested = combineReducersAndAddLater(
				{
					bob: nested,
					count,
				},
				'root',
				registry
			);
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

		test( 'deeply nested reducers work on persist when nesting a combineReducers reducer', () => {
			const registry = Object.create( null );
			reducers = combineReducers( {
				age,
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
			} );
			const veryNested = combineReducersAndAddLater(
				{
					bob: nested,
					count,
				},
				'root',
				registry
			);
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

		test( 'deeply nested reducers work on persist when being nested', () => {
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					age,
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
				},
				'nested',
				registry
			);
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
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
				},
				'nested',
				registry
			);
			const veryNested = combineReducersAndAddLater(
				{
					bob: nested,
					count,
				},
				'root',
				registry
			);
			const valid = veryNested( { bob: { person: { date: new Date( 234 ) } }, count: 122 }, write );
			expect( valid ).to.eql( { bob: { person: { height: 160, date: 234 } }, count: 1 } );

			const invalid = veryNested(
				{ bob: { person: { height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
			expect( invalid ).to.eql( { bob: { person: { height: 160, date: -5 } }, count: 1 } );
		} );

		test( 'deeply nested reducers work with reducer with a custom handler when nesting a combineReducers reducer', () => {
			const registry = Object.create( null );
			reducers = combineReducers( {
				height,
				date,
			} );
			const nested = combineReducers( {
				person: reducers,
			} );
			const veryNested = combineReducersAndAddLater(
				{
					bob: nested,
					count,
				},
				'root',
				registry
			);
			const valid = veryNested( { bob: { person: { date: new Date( 234 ) } }, count: 122 }, write );
			expect( valid ).to.eql( { bob: { person: { height: 160, date: 234 } }, count: 1 } );

			const invalid = veryNested(
				{ bob: { person: { height: 22, date: new Date( -5 ) } }, count: 123 },
				write
			);
			expect( invalid ).to.eql( { bob: { person: { height: 160, date: -5 } }, count: 1 } );
		} );

		test( 'deeply nested reducers work with reducer with a custom handler when being nested', () => {
			const registry = Object.create( null );
			reducers = combineReducersAndAddLater(
				{
					height,
					date,
				},
				'person',
				registry
			);
			const nested = combineReducersAndAddLater(
				{
					person: reducers,
				},
				'nested',
				registry
			);
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
			reducers = combineReducersAndAddLater(
				{
					height: withSchemaValidation( schema, height ),
					count,
				},
				'test',
				Object.create( {} )
			);

			const valid = reducers( { height: 22, count: 44 }, write );
			expect( valid ).to.eql( { height: 22, count: 1 } );

			const invalid = reducers( { height: -1, count: 44 }, load );
			expect( invalid ).to.eql( { height: 160, count: 1 } );
		} );

		test( 'uses the provided validation from createReducer', () => {
			reducers = combineReducersAndAddLater(
				{
					height: createReducer( 160, {}, schema ),
					count,
				},
				'test',
				Object.create( {} )
			);

			const valid = reducers( { height: 22, count: 44 }, write );
			expect( valid ).to.eql( { height: 22, count: 1 } );

			const invalid = reducers( { height: -1, count: 44 }, load );
			expect( invalid ).to.eql( { height: 160, count: 1 } );
		} );
	} );

	describe( '#addReducers', () => {
		const initialAppState = deepFreeze( {
			age: 20,
			height: 171,
		} );

		test( 'should not load height, because it is missing a schema, when height reducer loads', () => {
			const registry = Object.create( null );
			const reducers = combineReducersAndAddLater(
				{
					age,
				},
				'test',
				registry
			);
			const store = createStore( reducers, initialAppState );
			store.dispatch( load );
			addReducers( { height }, 'test', registry, action => store.dispatch( action ) );
			expect( store.getState() ).to.eql( { age: 20, height: 160 } );
		} );

		test( 'should validate age, when age reducer loads', () => {
			const registry = Object.create( null );
			const reducers = combineReducersAndAddLater(
				{
					height,
				},
				'test',
				registry
			);
			const store = createStore( reducers, { age: -5 } );
			store.dispatch( load );
			addReducers( { age }, 'test', registry, action => store.dispatch( action ) );
			expect( store.getState() ).to.eql( { age: 0, height: 160 } );
		} );

		test( 'actions work as expected, on loaded and initial reducers', () => {
			const registry = Object.create( null );
			const reducers = combineReducersAndAddLater(
				{
					age,
				},
				'test',
				registry
			);
			const store = createStore( reducers, initialAppState );
			store.dispatch( load );
			addReducers( { height }, 'test', registry, action => store.dispatch( action ) );
			store.dispatch( grow );
			expect( store.getState() ).to.eql( { age: 21, height: 161 } );
		} );
	} );
} );
