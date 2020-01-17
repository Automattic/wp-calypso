/**
 * @jest-environment jsdom
 */

/**
 * Internal Dependencies
 */
import reducer from '../reducer';

describe( 'Experiment Reducer', () => {
	describe( 'Init Action', () => {
		test( 'Should reduce init with no cookie', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: null,
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).toHaveProperty( 'anonId', null );
		} );

		test( 'Should reduce init action with cookie, but no tk_ai cookie', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'some=cookie; other=cookie;',
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).toHaveProperty( 'anonId', null );
		} );

		test( 'Should reduce init action with tk_ai cookie', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'some=cookie; tk_ai=123; other=cookie;',
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).toHaveProperty( 'anonId', '123' );
		} );

		test( 'Should replace anonId in state, if changed', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'some=cookie; other=cookie; tk_ai=123;',
			} );
			const state = reducer( { anonId: 'abc' }, { type: '@@INIT' } );
			expect( state ).toHaveProperty( 'anonId', '123' );
		} );

		test( 'Should reduce anonId with equals in it', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'tk_ai=abc=123; other=cookie; some=cookie;',
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).toHaveProperty( 'anonId', 'abc=123' );
		} );

		test( 'Should reduce empty anonId', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'tk_ai=; some=cookie; other=;',
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).toHaveProperty( 'anonId', null );
		} );
	} );
} );
