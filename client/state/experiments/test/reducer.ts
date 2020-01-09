/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import reducer from '../reducer';

describe( 'ExperimentReducer', () => {
	describe( 'Init Reducer', () => {
		test( 'Should reduce init with no cookies', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: null,
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).to.have.nested.property( 'anonId', null );
		} );
		test( 'Should reduce init with cookies, but no tk_ai cookie', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'some=cookie; other=cookie;',
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).to.have.nested.property( 'anonId', null );
		} );
		test( 'Should reduce init with tk_ai cookie', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'some=cookie; tk_ai=123; other=cookie;',
			} );
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).to.have.nested.property( 'anonId', '123' );
		} );
		test( 'Should replace existing anonId if changed', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'some=cookie; other=cookie; tk_ai=123',
			} );
			const state = reducer( { anonId: 'abc' }, { type: '@@INIT' } );
			expect( state ).to.have.nested.property( 'anonId', '123' );
		} );
	} );
} );
