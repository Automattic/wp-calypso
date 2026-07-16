import { describe, expect, jest, test } from '@jest/globals';
import {
	assertSuccessfulNewUserResponse,
	UserSignupPage,
} from '../../../lib/pages/signup/user-signup-page';
import type { Page } from 'playwright';

const successfulResponse = {
	code: 200,
	body: {
		success: true,
		user_id: 123,
		username: 'e2eflowtesting123',
		bearer_token: 'token',
	},
};

describe( 'assertSuccessfulNewUserResponse', () => {
	test( 'returns a response containing a usable account identity', () => {
		expect( assertSuccessfulNewUserResponse( successfulResponse ) ).toBe( successfulResponse );
	} );

	test( 'normalizes a numeric-string user_id to a number', () => {
		const response = {
			code: 200,
			body: { ...successfulResponse.body, user_id: '123' },
		};
		expect( assertSuccessfulNewUserResponse( response ).body.user_id ).toBe( 123 );
	} );

	test( 'rejects an explicitly throttled signup response', () => {
		expect( () =>
			assertSuccessfulNewUserResponse( {
				code: 200,
				body: {
					success: false,
					error: 'throttled',
					message: 'Limit reached.',
				},
			} )
		).toThrow( 'User signup did not create a usable account: throttled: Limit reached.' );
	} );

	test.each( [
		[ 'user ID', { ...successfulResponse.body, user_id: undefined } ],
		[ 'boolean user ID', { ...successfulResponse.body, user_id: true } ],
		[ 'array user ID', { ...successfulResponse.body, user_id: [ 123 ] } ],
		[ 'non-numeric string user ID', { ...successfulResponse.body, user_id: 'abc' } ],
		[ 'username', { ...successfulResponse.body, username: '' } ],
		[ 'bearer token', { ...successfulResponse.body, bearer_token: '' } ],
	] )( 'rejects a successful response without a usable %s', ( _field, body ) => {
		expect( () => assertSuccessfulNewUserResponse( { code: 200, body } ) ).toThrow(
			'User signup did not create a usable account.'
		);
	} );

	test( 'rejects a malformed response', () => {
		expect( () => assertSuccessfulNewUserResponse( null ) ).toThrow(
			'User signup did not create a usable account.'
		);
	} );
} );

describe( 'UserSignupPage', () => {
	test( 'returns a partial invite signup response so the caller can retain it for cleanup', async () => {
		// Deliberately omits bearer_token: the invite path must return the raw
		// response for cleanup and must NOT run assertSuccessfulNewUserResponse,
		// which would throw here. This case fails if the guard is added to it.
		const partialResponse = {
			code: 200,
			body: {
				success: true,
				user_id: 123,
				username: 'e2eflowtesting123',
			},
		};
		const locator = {
			click: jest.fn( async () => undefined ),
			fill: jest.fn( async () => undefined ),
		};
		const page = {
			getByRole: jest.fn( () => locator ),
			locator: jest.fn( () => locator ),
			waitForResponse: jest.fn( async () => ( {
				json: async () => partialResponse,
			} ) ),
		} as unknown as Page;

		const signupPage = new UserSignupPage( page );

		await expect( signupPage.signupThroughInvite( 'test@example.com' ) ).resolves.toBe(
			partialResponse
		);
	} );
} );
