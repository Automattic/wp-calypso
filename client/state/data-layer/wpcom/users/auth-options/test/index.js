import { getAuthAccountType } from '../';

describe( 'account lookup request', () => {
	test( 'sends the Blackbox session with the encoded account identifier', () => {
		const request = getAuthAccountType( {
			usernameOrEmail: 'someone+test@example.com',
			blackboxSessionId: 'session-id',
		} );
		expect( request.method ).toBe( 'GET' );
		expect( request.path ).toBe( '/users/someone%2Btest%40example.com/auth-options' );
		expect( request.query ).toEqual( { apiVersion: '1.1', blackbox_session_id: 'session-id' } );
	} );

	test( 'omits the session parameter when no session is available', () => {
		const request = getAuthAccountType( { usernameOrEmail: 'someone' } );
		expect( request.query ).toEqual( { apiVersion: '1.1' } );
	} );
} );
