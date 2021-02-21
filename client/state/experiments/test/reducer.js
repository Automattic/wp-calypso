/**
 * @jest-environment jsdom
 */

/**
 * Internal Dependencies
 */
import reducer from '../reducer';
import { EXPERIMENT_ASSIGN, EXPERIMENT_FETCH } from 'calypso/state/action-types';

describe( 'Experiment Reducer', () => {
	describe( 'Init Action', () => {
		test( 'Should reduce init with no cookie', () => {
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: '',
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

	describe( 'Assignment Action', () => {
		const exampleState = () => ( {
			anonId: null,
			isLoading: true,
			nextRefresh: 123,
			variations: null,
		} );

		const action = ( variations, nextRefresh ) => ( {
			type: EXPERIMENT_ASSIGN,
			variations,
			nextRefresh,
		} );

		test( 'It should assign the experiments', () => {
			const state = reducer( exampleState(), action( { abc: '123' }, 456 ) );
			expect( state ).toEqual( {
				...exampleState(),
				isLoading: false,
				nextRefresh: 456,
				variations: { abc: '123' },
			} );
		} );
	} );

	describe( 'Fetch Action', () => {
		test( 'It should flip the loading state', () => {
			const state = reducer( { isLoading: false }, { type: EXPERIMENT_FETCH } );
			expect( state ).toHaveProperty( 'isLoading', true );
		} );
	} );
} );
