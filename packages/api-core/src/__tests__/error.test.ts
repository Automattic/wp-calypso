import { classifyAuthError } from '../error';

function wpError( fields: Record< string, unknown > ) {
	const status = ( fields.statusCode as number ) ?? 403;
	return Object.assign( new Error( 'nope' ), { status, statusCode: status, ...fields } );
}

describe( 'classifyAuthError', () => {
	test.each( [
		[
			'a v1 endpoint that did not authenticate the request',
			401,
			{ error: 'authorization_required' },
		],
		[ 'a WP REST endpoint that did not authenticate the request', 401, { code: 'rest_forbidden' } ],
	] )( 'reports %s as expired', ( _label, statusCode, fields ) => {
		expect( classifyAuthError( wpError( { statusCode, ...fields } ) ) ).toBe( 'expired' );
	} );

	test.each( [
		[ 'a v1 endpoint refusing an authenticated request', 403, { error: 'authorization_required' } ],
		[ 'a WP REST endpoint refusing an authenticated request', 403, { code: 'rest_forbidden' } ],
	] )( 'reports %s as forbidden', ( _label, statusCode, fields ) => {
		expect( classifyAuthError( wpError( { statusCode, ...fields } ) ) ).toBe( 'forbidden' );
	} );

	it( 'reads the code from `error` when both fields are present', () => {
		expect(
			classifyAuthError(
				wpError( { statusCode: 403, error: 'authorization_required', code: 'x' } )
			)
		).toBe( 'forbidden' );
	} );

	it( 'ignores an unrelated API failure', () => {
		expect( classifyAuthError( wpError( { statusCode: 500, error: 'server_error' } ) ) ).toBeNull();
	} );

	it( 'ignores a 401 that is not an auth code', () => {
		expect( classifyAuthError( wpError( { statusCode: 401, error: 'server_error' } ) ) ).toBeNull();
	} );

	it( 'ignores anything that is not a WPError', () => {
		expect( classifyAuthError( new Error( 'boom' ) ) ).toBeNull();
		expect( classifyAuthError( undefined ) ).toBeNull();
		expect( classifyAuthError( { statusCode: 401, error: 'authorization_required' } ) ).toBeNull();
	} );
} );
