/**
 * @jest-environment jsdom
 */

/**
 * Internal Dependencies
 */
import reducer from '../reducer';
import { CURRENT_USER_RECEIVE, EXPERIMENT_ASSIGN, EXPERIMENT_FETCH } from 'state/action-types';

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

	describe( 'Assignment Action', () => {
		const exampleState = () => ( {
			anonId: null,
			isLoading: true,
			nextRefresh: 123,
			tests: null,
		} );

		const action = ( tests, nextRefresh ) => ( {
			type: EXPERIMENT_ASSIGN,
			tests,
			nextRefresh,
		} );

		test( 'It should assign the experiments', () => {
			const state = reducer( exampleState(), action( { abc: '123' }, 456 ) );
			expect( state ).toEqual( {
				...exampleState(),
				isLoading: false,
				nextRefresh: 456,
				tests: { abc: '123' },
			} );
		} );
	} );

	describe( 'Fetch Action', () => {
		test( 'It should flip the loading state', () => {
			const state = reducer( { isLoading: false }, { type: EXPERIMENT_FETCH } );
			expect( state ).toHaveProperty( 'isLoading', true );
		} );
	} );

	describe( 'User recieve action', () => {
		test( 'It should reset the assignments, except for the anonId', () => {
			const initialState = {
				anonId: 'hello world',
				isLoading: false,
				nextRefresh: 123,
				tests: {
					example: 'abc',
				},
			};
			const state = reducer( initialState, { type: CURRENT_USER_RECEIVE } );
			expect( state ).toHaveProperty( 'anonId', initialState.anonId );
			expect( state ).toHaveProperty( 'tests', null );
			expect( state ).toHaveProperty( 'isLoading', true );
		} );
	} );
} );
