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
import { currentUser, newUserData, newUserError, isFetchingNewUser } from '../reducer';
import { createActions } from '../actions';

const {
	receiveCurrentUser,
	receiveCurrentUserFailed,
	fetchNewUser,
	receiveNewUser,
	receiveNewUserFailed,
	clearErrors,
} = createActions( {
	client_id: '',
	client_secret: '',
} );

const newUserSuccessResponse = {
	success: true,
	bearer_token: 'bearer-token',
	username: 'testusernamer12345',
	user_id: 12345,
	is_signup_sandbox: false,
};

const newUserSuccessResponseSandboxed = {
	success: true,
	bearer_token: 'bearer-token',
	signup_sandbox_username: 'testusernamer12345',
	signup_sandbox_user_id: 12345,
	is_signup_sandbox: true,
};

const newUserErrorResponse = {
	error: 'email_exists',
	status: 400,
	statusCode: 400,
	name: 'EmailExistsError',
	message: 'Invalid email input',
};

describe( 'currentUser', () => {
	it( 'defaults to undefined', () => {
		const state = currentUser( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toBe( undefined );
	} );

	it( 'returns a current user object', () => {
		const testUser = {
			ID: 1,
			username: 'testusername',
			display_name: 'testusername',
			language: 'en',
			locale_variant: '',
		};
		const state = currentUser( undefined, receiveCurrentUser( testUser ) );
		expect( state ).toEqual( testUser );
	} );

	it( 'returns null if receiving the current user failed', () => {
		const state = currentUser( undefined, receiveCurrentUserFailed() );
		expect( state ).toBe( null );
	} );
} );

describe( 'newUserData', () => {
	it( 'defaults to undefined', () => {
		const state = newUserData( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toBe( undefined );
	} );

	it( 'sets username, userId, and bearerToken from a standard response', () => {
		const state = newUserData( undefined, receiveNewUser( newUserSuccessResponse ) );
		const { username, user_id, bearer_token } = newUserSuccessResponse;
		expect( state ).toEqual( {
			username,
			userId: user_id,
			bearerToken: bearer_token,
		} );
	} );

	it( 'set username, userId, and bearerToken from a sandboxed response', () => {
		const state = newUserData( undefined, receiveNewUser( newUserSuccessResponseSandboxed ) );
		const {
			signup_sandbox_username,
			signup_sandbox_user_id,
			bearer_token,
		} = newUserSuccessResponseSandboxed;
		expect( state ).toEqual( {
			username: signup_sandbox_username,
			userId: signup_sandbox_user_id,
			bearerToken: bearer_token,
		} );
	} );
} );

describe( 'newUserError', () => {
	it( 'defaults to undefined', () => {
		const state = newUserError( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toBe( undefined );
	} );

	it( 'stores an error message', () => {
		const state = newUserError( undefined, receiveNewUserFailed( newUserErrorResponse ) );
		expect( state ).toEqual( newUserErrorResponse );
	} );

	it( 'clears existing error messages on clearErrors', () => {
		const originalState = newUserError( undefined, receiveNewUserFailed( newUserErrorResponse ) );
		expect( originalState ).toEqual( newUserErrorResponse );
		const state = newUserError( originalState, clearErrors() );
		expect( state ).toBe( undefined );
	} );

	it( 'clears existing error messages on fetching a new user', () => {
		const originalState = newUserError( undefined, receiveNewUserFailed( newUserErrorResponse ) );
		expect( originalState ).toEqual( newUserErrorResponse );
		const state = newUserError( originalState, fetchNewUser() );
		expect( state ).toBe( undefined );
	} );

	it( 'clears existing error messages on receiving a new user', () => {
		const originalState = newUserError( undefined, receiveNewUserFailed( newUserErrorResponse ) );
		expect( originalState ).toEqual( newUserErrorResponse );
		const state = newUserError( originalState, receiveNewUser( newUserSuccessResponse ) );
		expect( state ).toBe( undefined );
	} );
} );

describe( 'isFetchingNewUser', () => {
	it( 'defaults to false', () => {
		const state = isFetchingNewUser( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toBe( false );
	} );

	it( 'returns true on fetching a new user', () => {
		const state = isFetchingNewUser( undefined, fetchNewUser() );
		expect( state ).toBe( true );
	} );

	it( 'returns false on receiving a new user', () => {
		const state = isFetchingNewUser( true, receiveNewUser( newUserSuccessResponse ) );
		expect( state ).toBe( false );
	} );

	it( 'returns false on a failed new user request', () => {
		const state = isFetchingNewUser( true, receiveNewUserFailed( newUserErrorResponse ) );
		expect( state ).toBe( false );
	} );
} );
