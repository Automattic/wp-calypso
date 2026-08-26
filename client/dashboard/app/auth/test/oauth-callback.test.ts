/**
 * @jest-environment jsdom
 */
import { handleOAuthCallback, OAUTH_CALLBACK_PATH } from '../oauth-callback';

jest.mock( 'store', () => ( { set: jest.fn() } ) );

const FALLBACK = '/sites';

describe( 'handleOAuthCallback', () => {
	const replace = jest.fn();

	function setLocation( { search = '', hash = '' }: { search?: string; hash?: string } ) {
		Object.defineProperty( window, 'location', {
			value: { pathname: OAUTH_CALLBACK_PATH, search, hash, replace },
			writable: true,
			configurable: true,
		} );
	}

	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.setItem( 'wpcom_oauth_state', 'expected-state' );
	} );

	test( 'redirects to the fallback route on invalid state', () => {
		setLocation( { hash: '#state=wrong-state&access_token=abc' } );
		expect( handleOAuthCallback( FALLBACK ) ).toBe( true );
		expect( replace ).toHaveBeenCalledWith( FALLBACK );
	} );

	test( 'redirects to the fallback route when next is missing', () => {
		setLocation( { hash: '#state=expected-state&access_token=abc' } );
		handleOAuthCallback( FALLBACK );
		expect( replace ).toHaveBeenCalledWith( FALLBACK );
	} );

	test( 'redirects to the fallback route when next is a bare root', () => {
		for ( const next of [ '/', '/?source=x', '/#section' ] ) {
			sessionStorage.setItem( 'wpcom_oauth_state', 'expected-state' );
			setLocation( {
				search: `?next=${ encodeURIComponent( next ) }`,
				hash: '#state=expected-state&access_token=abc',
			} );
			handleOAuthCallback( FALLBACK );
			expect( replace ).toHaveBeenLastCalledWith( FALLBACK );
		}
	} );

	test( 'redirects to a valid relative next', () => {
		setLocation( {
			search: `?next=${ encodeURIComponent( '/domains' ) }`,
			hash: '#state=expected-state&access_token=abc',
		} );
		handleOAuthCallback( FALLBACK );
		expect( replace ).toHaveBeenCalledWith( '/domains' );
	} );

	test( 'redirects to the fallback route when next is not relative', () => {
		setLocation( {
			search: `?next=${ encodeURIComponent( 'https://evil.example' ) }`,
			hash: '#state=expected-state&access_token=abc',
		} );
		handleOAuthCallback( FALLBACK );
		expect( replace ).toHaveBeenCalledWith( FALLBACK );
	} );
} );
