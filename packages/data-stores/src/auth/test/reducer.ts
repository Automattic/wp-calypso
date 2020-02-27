/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { credentials, loginFlowState } from '../reducer';
import { reset, receiveAuthOptions } from '../actions';

describe( 'login flow state', () => {
	it( 'returns the correct default state', () => {
		const state = loginFlowState( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toBe( 'ENTER_USERNAME_OR_EMAIL' );
	} );

	it( 'is returned to the default state by the reset action', () => {
		const defaultState = loginFlowState( undefined, { type: 'TEST_ACTION' } );

		const state = loginFlowState( 'ENTER_PASSWORD', reset() );
		expect( state ).toBe( defaultState );
	} );
} );

describe( 'credentials', () => {
	it( 'defaults to empty', () => {
		const state = credentials( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( {
			usernameOrEmail: '',
			password: '',
		} );
	} );

	it( 'is returned to the default state by the reset action', () => {
		const defaultState = credentials( undefined, { type: 'TEST_ACTION' } );

		const state = credentials( { usernameOrEmail: 'test', password: 'test' }, reset() );
		expect( state ).toEqual( defaultState );
	} );

	it( 'updates the username after successfully checking auth_options', () => {
		const state = credentials(
			{ usernameOrEmail: 'old username', password: 'old password' },
			receiveAuthOptions( { passwordless: true, email_verified: true }, 'new username' )
		);
		expect( state ).toEqual( {
			usernameOrEmail: 'new username',
			password: 'old password',
		} );
	} );
} );
