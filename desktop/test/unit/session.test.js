jest.mock( '../../app/lib/keychain', () => ( {
	write: jest.fn( () => Promise.resolve() ),
	clear: jest.fn(),
} ) );
jest.mock( '../../app/lib/logger', () => () => ( {
	info: jest.fn(),
	debug: jest.fn(),
	error: jest.fn(),
} ) );

const keychain = require( '../../app/lib/keychain' );
const sessionManager = require( '../../app/lib/session' );

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
		jest.clearAllMocks();
		sessionManager.removeAllListeners();

		const cookies = {
			get: jest.fn( ( { name } ) =>
				Promise.resolve( name === 'wordpress_logged_in' ? [ loggedInCookie ] : [] )
			),
			on: jest.fn( ( event, listener ) => ( onCookieChanged = listener ) ),
		};
		await sessionManager.init( { webContents: { session: { cookies } } } );

		loggedIn = jest.fn();
		loggedOut = jest.fn();
		sessionManager.on( 'logged-in', loggedIn );
		sessionManager.on( 'logged-out', loggedOut );
		jest.clearAllMocks();
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
