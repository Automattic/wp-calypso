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
import { errors, loginFlowState, usernameOrEmail } from '../reducer';
import { createActions } from '../actions';

const { reset, receiveAuthOptions, clearErrors } = createActions( {
	client_id: '',
	client_secret: '',
} );

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

describe( 'usernameOrEmail', () => {
	it( 'defaults to empty', () => {
		const state = usernameOrEmail( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( '' );
	} );

	it( 'is returned to the default state by the reset action', () => {
		const defaultState = usernameOrEmail( undefined, { type: 'TEST_ACTION' } );

		const state = usernameOrEmail( 'test', reset() );
		expect( state ).toEqual( defaultState );
	} );

	it( 'updates after successfully checking auth_options', () => {
		const state = usernameOrEmail(
			'old username',
			receiveAuthOptions( { passwordless: true, email_verified: true }, 'new username' )
		);
		expect( state ).toBe( 'new username' );
	} );
} );

describe( 'errors', () => {
	it( 'defaults to empty', () => {
		const state = errors( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( [] );
	} );

	it( 'is returned to the default state by the reset action', () => {
		const defaultState = errors( undefined, { type: 'TEST_ACTION' } );

		const state = errors( [ { code: 'code', message: '' } ], reset() );
		expect( state ).toEqual( defaultState );
	} );

	it( 'is emptied by the clearErrors action', () => {
		const state = errors( [ { code: 'code', message: '' } ], clearErrors() );
		expect( state ).toEqual( [] );
	} );
} );
