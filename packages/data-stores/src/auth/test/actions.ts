/**
 * Internal dependencies
 */
import { submitPassword } from '../actions';

describe( 'submitPassword', () => {
	it( 'logins in to remote services on successful login', async () => {
		const password = 'passw0rd';
		const generator = submitPassword( password );

		expect( generator.next().value ).toEqual( {
			type: 'CLEAR_ERRORS',
		} );

		expect( generator.next().value ).toEqual( {
			type: 'SELECT_USERNAME_OR_EMAIL',
		} );

		const username = 'user1';
		expect( generator.next( username ).value ).toEqual( {
			type: 'FETCH_WP_LOGIN',
			action: 'login-endpoint',
			params: { username, password },
		} );

		const token_links = [ 'https://gravator.com?login-url', 'https://jetpack.com?login-url' ];

		expect(
			generator.next( { ok: true, body: { success: true, data: { token_links } } } ).value
		).toEqual( {
			type: 'REMOTE_LOGIN_USER',
			loginLinks: token_links,
		} );
	} );

	it( 'dispatches failed action if exception is thrown by fetch', async () => {
		const password = 'passw0rd';
		const generator = submitPassword( password );

		expect( generator.next().value ).toEqual( {
			type: 'CLEAR_ERRORS',
		} );

		expect( generator.next().value ).toEqual( {
			type: 'SELECT_USERNAME_OR_EMAIL',
		} );

		const username = 'user1';
		expect( generator.next( username ).value ).toEqual( {
			type: 'FETCH_WP_LOGIN',
			action: 'login-endpoint',
			params: { username, password },
		} );

		const errorMessage = 'Error!!1';
		expect( generator.throw( new Error( errorMessage ) ).value ).toEqual( {
			type: 'RECEIVE_WP_LOGIN_FAILED',
			response: {
				success: false,
				data: {
					errors: [ { code: 'Error', message: 'Error!!1' } ],
				},
			},
		} );
	} );
} );
