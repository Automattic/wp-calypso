import { vi } from 'vitest';
import keychain from '../../app/lib/keychain';
import sessionManager from '../../app/lib/session';

vi.mock( '../../app/lib/keychain', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		write: vi.fn( () => Promise.resolve() ),
		clear: vi.fn(),
	} )
);
vi.mock( '../../app/lib/logger', () => ( {
	default: () => ( {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
	} ),
} ) );

const loggedInCookie = {
	name: 'wordpress_logged_in',
	domain: '.wordpress.com',
	value: 'user%7Ctoken',
};

describe( 'SessionManager', () => {
	let onCookieChanged;
	let loggedIn;
	let loggedOut;

	beforeEach( async () => {
		vi.clearAllMocks();
		sessionManager.removeAllListeners();

		const cookies = {
			get: vi.fn( ( { name } ) =>
				Promise.resolve( name === 'wordpress_logged_in' ? [ loggedInCookie ] : [] )
			),
			on: vi.fn( ( event, listener ) => ( onCookieChanged = listener ) ),
		};
		await sessionManager.init( { webContents: { session: { cookies } } } );

		loggedIn = vi.fn();
		loggedOut = vi.fn();
		sessionManager.on( 'logged-in', loggedIn );
		sessionManager.on( 'logged-out', loggedOut );
		vi.clearAllMocks();
	} );

	it( 'starts logged in when the login cookie exists', () => {
		expect( sessionManager.isLoggedIn() ).toBe( true );
	} );

	it( 'ignores the removal half of a cookie overwrite', async () => {
		await onCookieChanged( {}, loggedInCookie, 'overwrite', true );

		expect( loggedOut ).not.toHaveBeenCalled();
		expect( keychain.clear ).not.toHaveBeenCalled();
		expect( sessionManager.isLoggedIn() ).toBe( true );

		await onCookieChanged( {}, { ...loggedInCookie, value: 'new' }, 'inserted', false );

		expect( loggedIn ).toHaveBeenCalledTimes( 1 );
		expect( keychain.write ).toHaveBeenCalledWith( 'wordpress_logged_in', 'new' );
	} );

	it.each( [ 'explicit', 'expired', 'expired-overwrite', 'evicted' ] )(
		"logs out when the login cookie is removed with cause '%s'",
		async ( cause ) => {
			await onCookieChanged( {}, loggedInCookie, cause, true );

			expect( loggedOut ).toHaveBeenCalledTimes( 1 );
			expect( keychain.clear ).toHaveBeenCalledTimes( 1 );
			expect( sessionManager.isLoggedIn() ).toBe( false );
		}
	);
} );
