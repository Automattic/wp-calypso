/**
 * @jest-environment jsdom
 */
import { fetchMagicLoginAuthenticate } from '../actions';

const dispatchAuthenticate = ( blackboxSessionId ) => {
	fetchMagicLoginAuthenticate( 'a-token', '', null, true, blackboxSessionId )( jest.fn() );
	return new URLSearchParams( globalThis.fetch.mock.calls[ 0 ][ 1 ].body );
};

describe( 'fetchMagicLoginAuthenticate', () => {
	beforeEach( () => {
		globalThis.fetch = jest.fn( () => new Promise( () => {} ) );
	} );

	// wpcom verifies a session with the key named by its version. Without the
	// version, a session collected with the login key fails the scope check.
	it( 'sends the key version with the Blackbox session', () => {
		const body = dispatchAuthenticate( 'ABCDEFGHIJKLMNOPQRSTuv' );

		expect( body.get( 'blackbox_session_id' ) ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
		expect( body.get( 'blackbox_key_version' ) ).toBe( '2' );
	} );

	it( 'sends no key version without a Blackbox session', () => {
		const body = dispatchAuthenticate( null );

		expect( body.has( 'blackbox_session_id' ) ).toBe( false );
		expect( body.has( 'blackbox_key_version' ) ).toBe( false );
	} );
} );
