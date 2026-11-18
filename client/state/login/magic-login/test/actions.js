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

	it( 'sends the Blackbox session id when available', () => {
		const body = dispatchAuthenticate( 'ABCDEFGHIJKLMNOPQRSTuv' );

		expect( body.get( 'blackbox_session_id' ) ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	it( 'sends no Blackbox session without a session id', () => {
		const body = dispatchAuthenticate( null );

		expect( body.has( 'blackbox_session_id' ) ).toBe( false );
	} );
} );
