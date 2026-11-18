import { isInaccessibleJetpackError } from '../error';

function createError( message: string, props: Record< string, unknown > = {} ) {
	return Object.assign( new Error( message ), props );
}

describe( 'isInaccessibleJetpackError', () => {
	it( 'matches the inaccessible Jetpack site error code regardless of the message', () => {
		const error = createError( 'We couldn’t connect to your site.', {
			error: 'inaccessible_jetpack_site',
		} );
		expect( isInaccessibleJetpackError( error ) ).toBe( true );
	} );

	it( 'matches the inaccessible Jetpack site message anywhere in the text', () => {
		expect(
			isInaccessibleJetpackError(
				createError( 'The Jetpack site is inaccessible or returned an error: transport error', {
					error: 'server_error',
				} )
			)
		).toBe( true );
		expect(
			isInaccessibleJetpackError(
				createError( 'Error: the Jetpack site is inaccessible.', { error: 'jetpack_not_found' } )
			)
		).toBe( true );
	} );

	it( 'matches disabled API calls returned as an unauthorized error', () => {
		const error = createError( 'API calls to this blog have been disabled.' );
		error.name = 'UnauthorizedError';
		expect( isInaccessibleJetpackError( error ) ).toBe( true );
	} );

	it( 'does not match unrelated errors', () => {
		const error = createError( 'Not found', { error: 'unknown_blog' } );
		expect( isInaccessibleJetpackError( error ) ).toBe( false );
		expect( isInaccessibleJetpackError( { error: 'inaccessible_jetpack_site' } ) ).toBe( false );
		expect( isInaccessibleJetpackError( undefined ) ).toBe( false );
	} );
} );
