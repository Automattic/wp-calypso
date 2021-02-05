/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import type { Action } from 'redux';

/**
 * Internal dependencies
 */
import keyedReducer from '..';
import type { KeyedReducerAction } from '..';

type PersonAction = { name?: string | number; person?: { name?: string | number } };
type GrowAction = Action< 'GROW' > & PersonAction;
type ResetAction = Action< 'RESET' > & PersonAction;
type RemoveAction = Action< 'REMOVE' > & PersonAction;
type StayAction = Action< 'STAY' > & PersonAction;

type AgeAction = KeyedReducerAction< GrowAction | ResetAction | RemoveAction | StayAction >;

describe( 'keyedReducer', () => {
	const grow = ( name: string | number ) => ( { type: 'GROW' as const, name } );
	const reset = ( name: string | number ) => ( { type: 'RESET' as const, name } );
	const remove = ( name: string | number ) => ( { type: 'REMOVE' as const, name } );

	const age = ( state = 0, action: AgeAction ) => {
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
		// @ts-ignore
		expect( () => keyedReducer( {}, age ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( true, age ) ).toThrow( TypeError );
		expect( () => keyedReducer( 10, age ) ).toThrow( TypeError );
		expect( () => keyedReducer( 15.4, age ) ).toThrow( TypeError );
		expect( () => keyedReducer( '', age ) ).toThrow( TypeError );
		expect( () => keyedReducer( 'key', age ) ).not.toThrow( TypeError );
	} );

	test( 'should only accept a function as the reducer argument', () => {
		expect( () => keyedReducer( 'key', null ) ).toThrow( TypeError );
		expect( () => keyedReducer( 'key', undefined ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( 'key', [] ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( 'key', {} ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( 'key', true ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( 'key', 10 ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( 'key', 15.4 ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( 'key', '' ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () => keyedReducer( 'key' ) ).toThrow( TypeError );
		// @ts-ignore
		expect( () =>
			keyedReducer( 'key', () => {
				/* empty for test */
			} )
		).not.toThrow( TypeError );
	} );

	test( 'should create keyed state given simple reducers', () => {
		const keyed = keyedReducer( 'name', age );
		expect( keyed( undefined, grow( 'Calypso' ) ) ).toEqual( {
			Calypso: 1,
		} );
	} );

	test( 'should handle keyNames referencing nested keys', () => {
		const keyed = keyedReducer( 'person.name', age );
		const action = { type: 'GROW' as const, person: { name: 'Calypso' } };
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
		type SetChicken = Action< 'SET_CHICKEN' > & { id: number };
		const chickenReducer = ( state = '', { type }: KeyedReducerAction< SetChicken > ) => {
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

		// @ts-ignore testing internals
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
		// @ts-ignore testing internals
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
		const state = { 1: 1 };
		const serialized = keyed( state, { type: 'SERIALIZE' } );
		// @ts-ignore testing internals
		expect( serialized.root() ).toEqual( { 1: 1 } );
	} );

	test( 'should deserialize no state into default empty state', () => {
		const keyed = keyedReducer( 'id', age );
		expect( keyed( undefined, { type: 'DESERIALIZE' } ) ).toEqual( {} );
	} );
} );
