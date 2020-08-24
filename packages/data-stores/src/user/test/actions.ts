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
import { createActions } from '../actions';

const client_id = 'magic_client_id';
const client_secret = 'magic_client_secret';

describe( 'createAccount', () => {
	const { createAccount } = createActions( {
		client_id,
		client_secret,
	} );

	const params = {
		email: 'test@example.com',
		extra: {
			username_hint: 'Test Site Title',
		},
	};

	const paramsWithPasswordAndLocale = {
		email: 'test@example.com',
		password: 'abctesting!',
		extra: {
			username_hint: 'Test Site Title',
		},
		locale: 'fr',
	};

	const defaults = {
		client_id,
		client_secret,
		is_passwordless: true,
		signup_flow_name: 'gutenboarding',
		locale: 'en',
	};

	it( 'requests a new passwordless account to be created', () => {
		const generator = createAccount( params );

		expect( generator.next().value ).toEqual( { type: 'FETCH_NEW_USER' } );

		const apiResponse = {
			success: true,
			bearer_token: 'bearer-token',
			username: 'testusernamer12345',
			user_id: 12345,
		};

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				body: {
					...defaults,
					...params,
					validate: false,
				},
			} ),
		} );

		expect( generator.next( apiResponse ).value ).toEqual( { type: 'RELOAD_PROXY' } );
		expect( generator.next().value ).toEqual( { type: 'REQUEST_ALL_BLOGS_ACCESS' } );

		expect( generator.next().value ).toEqual( {
			type: 'RECEIVE_NEW_USER',
			response: apiResponse,
		} );

		const finalResult = generator.next();

		expect( finalResult.value ).toEqual( { ok: true } );
		expect( finalResult.done ).toBe( true );
	} );

	it( 'receives an error object and returns ok=false', () => {
		const generator = createAccount( params );

		expect( generator.next().value ).toEqual( { type: 'FETCH_NEW_USER' } );

		const apiResponse = {
			error: 'email_exists',
			status: 400,
			statusCode: 400,
			name: 'EmailExistsError',
			message: 'Invalid email input',
		};

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				body: {
					...defaults,
					...params,
					validate: false,
				},
			} ),
		} );

		expect( generator.throw( apiResponse ).value ).toEqual( {
			type: 'RECEIVE_NEW_USER_FAILED',
			error: apiResponse,
		} );

		const finalResult = generator.next();

		expect( finalResult.value ).toMatchObject( { ok: false, newUserError: expect.anything() } );
		expect( finalResult.done ).toBe( true );
	} );

	it( 'requests a passwordful account to be created with French locale set in query', () => {
		const generator = createAccount( paramsWithPasswordAndLocale );

		expect( generator.next().value ).toEqual( { type: 'FETCH_NEW_USER' } );

		const apiResponse = {
			success: true,
			bearer_token: 'bearer-token',
			username: 'testusernamer12345',
			user_id: 12345,
		};

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				body: {
					...defaults,
					...paramsWithPasswordAndLocale,
					validate: false,
				},
				query: 'locale=fr',
			} ),
		} );

		expect( generator.next( apiResponse ).value ).toEqual( { type: 'RELOAD_PROXY' } );
		expect( generator.next().value ).toEqual( { type: 'REQUEST_ALL_BLOGS_ACCESS' } );

		expect( generator.next().value ).toEqual( {
			type: 'RECEIVE_NEW_USER',
			response: apiResponse,
		} );

		const finalResult = generator.next();

		expect( finalResult.value ).toEqual( { ok: true } );
		expect( finalResult.done ).toBe( true );
	} );
} );
