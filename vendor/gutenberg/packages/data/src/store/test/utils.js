/**
 * Internal dependencies
 */
import { onSubKey } from '../utils';

describe( 'onSubKey', () => {
	function createEnhancedReducer( actionProperty ) {
		const enhanceReducer = onSubKey( actionProperty );
		return enhanceReducer( ( state, action ) => 'Called by ' + action.caller );
	}

	it( 'should default to an empty object', () => {
		const reducer = createEnhancedReducer( 'caller' );
		const nextState = reducer( undefined, { type: '@@INIT' } );

		expect( nextState ).toEqual( {} );
	} );

	it( 'should ignore actions where property not present', () => {
		const state = {};
		const reducer = createEnhancedReducer( 'caller' );
		const nextState = reducer( state, { type: 'DO_FOO' } );

		expect( nextState ).toBe( state );
	} );

	it( 'should key by action property', () => {
		const reducer = createEnhancedReducer( 'caller' );

		let state = Object.freeze( {} );
		state = reducer( state, { type: 'DO_FOO', caller: 1 } );
		state = reducer( state, { type: 'DO_FOO', caller: 2 } );

		expect( state ).toEqual( {
			1: 'Called by 1',
			2: 'Called by 2',
		} );
	} );
} );
