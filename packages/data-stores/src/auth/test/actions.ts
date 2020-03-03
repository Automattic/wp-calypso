/**
 * Internal dependencies
 */
import { submitPassword } from '../actions';

describe( 'submitPassword', () => {
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
