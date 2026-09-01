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

type RouteHandler = ( route: unknown ) => Promise< unknown >;

/**
 * Lets everything already queued run, so a page object that registers its route
 * before clicking has done so by the time the test drives that route.
 */
const settle = () => new Promise( ( resolve ) => setImmediate( resolve ) );

/**
 * A page whose route registrations are collected rather than performed, so a
 * test can play the part of the network.
 */
const buildRoutedPage = () => {
	const locator = {
		click: jest.fn( async () => undefined ),
		fill: jest.fn( async () => undefined ),
		isVisible: jest.fn( async () => true ),
		scrollIntoViewIfNeeded: jest.fn( async () => undefined ),
		waitFor: jest.fn( async () => undefined ),
	};
	const handlers: RouteHandler[] = [];
	const page = {
		evaluate: jest.fn( async () => false ),
		getByRole: jest.fn( () => locator ),
		locator: jest.fn( () => locator ),
		route: jest.fn( async ( _pattern: RegExp, handler: RouteHandler ) => {
			handlers.push( handler );
		} ),
		waitForResponse: jest.fn( () => new Promise( () => undefined ) ),
	} as unknown as Page;

	return { handlers, page };
};

/**
 * Answers the signup request the page object is holding, the way the browser
 * would, and reports what was handed back to the page.
 */
const answerSignupRequest = async ( handler: RouteHandler, status: number, body: unknown ) => {
	const fallback = jest.fn( async () => undefined );
	const fulfill = jest.fn( async () => undefined );
	const text = JSON.stringify( body );

	await handler( {
		fallback,
		fetch: async () => ( {
			ok: () => status >= 200 && status < 300,
			status: () => status,
			text: async () => text,
		} ),
		fulfill,
		request: () => ( { method: () => 'POST' } ),
	} );

	return { fallback, fulfill };
};

describe( 'UserSignupPage', () => {
	test( 'surfaces a rejected signup response without waiting for an ok response', async () => {
		const { handlers, page } = buildRoutedPage();

		const signup = new UserSignupPage( page ).signup( 'test@example.com', 'tester', 'password' );
		await settle();

		await answerSignupRequest( handlers[ 0 ], 403, {
			body: { success: false, error: 'throttled', message: 'Limit reached.' },
		} );

		await expect( signup ).rejects.toThrow(
			'User signup did not create a usable account: throttled: Limit reached.'
		);
	} );

	test( 'reads the signup body from the network, not from the browser', async () => {
		// The read has to be answered from what was buffered here, because the
		// navigation a signup triggers empties the browser cache the page-side
		// `response.json()` reads from: it fails with "No resource with given
		// identifier found". This case fails if that read comes back.
		const { handlers, page } = buildRoutedPage();
		const response = {
			code: 200,
			body: { success: true, user_id: 123, username: 'e2eflowtesting123', bearer_token: 'token' },
		};

		const signup = new UserSignupPage( page ).signup( 'test@example.com', 'tester', 'password' );
		await settle();

		const { fulfill } = await answerSignupRequest( handlers[ 0 ], 200, response );

		await expect( signup ).resolves.toEqual( response );
		// The page still gets its answer: the capture reads the body, it does not
		// swallow the request.
		expect( fulfill ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'hands a transient upstream failure back and captures the retry that follows', async () => {
		// The retry path of signupWithEmail: a 502 is left for
		// captureUsersNewServerError to reject on, and the capture stays open for
		// the attempt that follows rather than answering with the failure.
		const { handlers, page } = buildRoutedPage();
		const response = {
			code: 200,
			body: { success: true, user_id: 123, username: 'e2eflowtesting123', bearer_token: 'token' },
		};

		const signup = new UserSignupPage( page ).signup( 'test@example.com', 'tester', 'password' );
		await settle();

		const failure = await answerSignupRequest( handlers[ 0 ], 502, 'Bad Gateway' );
		// The page still receives the failure: it is what the server-error watch
		// keys on to ask for a retry.
		expect( failure.fulfill ).toHaveBeenCalledTimes( 1 );

		await answerSignupRequest( handlers[ 0 ], 200, response );

		await expect( signup ).resolves.toEqual( response );
	} );

	test( 'leaves later signup requests alone once it has captured one', async () => {
		const { handlers, page } = buildRoutedPage();
		const response = {
			code: 200,
			body: { success: true, user_id: 123, username: 'e2eflowtesting123', bearer_token: 'token' },
		};

		const signup = new UserSignupPage( page ).signup( 'test@example.com', 'tester', 'password' );
		await settle();

		await answerSignupRequest( handlers[ 0 ], 200, response );
		await expect( signup ).resolves.toEqual( response );

		// The handler cannot be unrouted, so it has to stand aside on its own: it
		// outlives the capture, and a later signup on the same page belongs to
		// whichever capture is waiting for it.
		const later = await answerSignupRequest( handlers[ 0 ], 200, response );
		expect( later.fallback ).toHaveBeenCalledTimes( 1 );
		expect( later.fulfill ).not.toHaveBeenCalled();
	} );

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
		const { handlers, page } = buildRoutedPage();

		const signup = new UserSignupPage( page ).signupThroughInvite( 'test@example.com' );
		await settle();

		await answerSignupRequest( handlers[ 0 ], 200, partialResponse );

		await expect( signup ).resolves.toEqual( partialResponse );
	} );

	test( 'returns a refused invite signup instead of waiting out an ok response', async () => {
		// The blackbox invite spec asserts on the refusal itself. Capturing only an
		// ok response would turn it into the capture timeout instead.
		const refusal = {
			code: 403,
			body: { error: 'throttled', message: 'Limit reached.' },
		};
		const { handlers, page } = buildRoutedPage();

		const signup = new UserSignupPage( page ).signupThroughInvite( 'test@example.com' );
		await settle();

		await answerSignupRequest( handlers[ 0 ], 403, refusal );

		await expect( signup ).resolves.toEqual( refusal );
	} );
} );
