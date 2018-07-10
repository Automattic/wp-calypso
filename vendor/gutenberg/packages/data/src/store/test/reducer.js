/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should default to an empty object', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	it( 'should return with started resolution', () => {
		const state = reducer( undefined, {
			type: 'START_RESOLUTION',
			reducerKey: 'test',
			selectorName: 'getFoo',
			args: [],
		} );

		// { test: { getFoo: EquivalentKeyMap( [] => true ) } }
		expect( state.test.getFoo.get( [] ) ).toBe( true );
	} );

	it( 'should return with finished resolution', () => {
		const original = reducer( undefined, {
			type: 'START_RESOLUTION',
			reducerKey: 'test',
			selectorName: 'getFoo',
			args: [],
		} );
		const state = reducer( deepFreeze( original ), {
			type: 'FINISH_RESOLUTION',
			reducerKey: 'test',
			selectorName: 'getFoo',
			args: [],
		} );

		// { test: { getFoo: EquivalentKeyMap( [] => false ) } }
		expect( state.test.getFoo.get( [] ) ).toBe( false );
	} );
} );
