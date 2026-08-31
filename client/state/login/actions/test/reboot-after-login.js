/**
 * @jest-environment jsdom
 */
import { rebootAfterLogin } from 'calypso/state/login/actions/reboot-after-login';
import { getRedirectToSanitized } from 'calypso/state/login/selectors';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEventWithClientId: jest.fn( ( name, props ) => ( {
		type: 'MOCK_TRACKS',
		name,
		props,
	} ) ),
} ) );

jest.mock( 'calypso/state/login/selectors', () => ( {
	getRedirectToSanitized: jest.fn(),
	isTwoFactorEnabled: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/lib/user/store', () => ( {
	clearStore: jest.fn( () => Promise.resolve() ),
	getStoredUserId: jest.fn( () => null ),
} ) );

const originalLocation = window.location;

describe( 'rebootAfterLogin', () => {
	let dispatch;
	let getState;

	const run = async () => {
		await rebootAfterLogin( { magic_login: 1 } )( dispatch, getState );
	};

	const trackedProps = () =>
		dispatch.mock.calls.map( ( [ action ] ) => action ).find( ( a ) => a?.type === 'MOCK_TRACKS' )
			?.props;

	beforeEach( () => {
		jest.clearAllMocks();
		dispatch = jest.fn( ( action ) =>
			typeof action === 'function' ? action( dispatch, getState ) : action
		);
		getState = jest.fn( () => ( {} ) );

		Object.defineProperty( window, 'location', {
			value: { href: '', origin: 'https://wordpress.com' },
			writable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	test( 'redirects to /home when there is no redirect', async () => {
		getRedirectToSanitized.mockReturnValue( null );

		await run();

		expect( window.location.href ).toBe( '/home' );
	} );

	test( 'redirects to the given destination', async () => {
		getRedirectToSanitized.mockReturnValue( '/sites' );

		await run();

		expect( window.location.href ).toBe( '/sites' );
	} );

	test( 'leaves an Atomic site destination untouched', async () => {
		const site = 'https://example.com/wp-login.php?action=jetpack-sso';
		getRedirectToSanitized.mockReturnValue( site );

		await run();

		expect( window.location.href ).toBe( site );
	} );

	test( 'still appends login_flow to the OAuth2 authorize hand-off', async () => {
		getRedirectToSanitized.mockReturnValue(
			'https://public-api.wordpress.com/oauth2/authorize?client_id=1'
		);

		await run();

		expect( window.location.href ).toBe(
			'https://public-api.wordpress.com/oauth2/authorize?client_id=1&login_flow=true'
		);
	} );

	test( 'unwraps a redirect that points back at the login page', async () => {
		getRedirectToSanitized.mockReturnValue( 'https://wordpress.com/log-in?redirect_to=%2Fsites' );

		await run();

		expect( window.location.href ).toBe( '/sites' );
	} );

	test( 'falls back to /home when the login page has no usable destination', async () => {
		getRedirectToSanitized.mockReturnValue( 'https://wordpress.com/log-in' );

		await run();

		expect( window.location.href ).toBe( '/home' );
	} );

	test( 'never redirects to the login page after a successful login', async () => {
		getRedirectToSanitized.mockReturnValue(
			'https://wordpress.com/log-in?redirect_to=' + encodeURIComponent( 'https://evil.example/' )
		);

		await run();

		expect( window.location.href ).toBe( '/home' );
	} );

	test( 'reports whether the redirect pointed at the login page', async () => {
		getRedirectToSanitized.mockReturnValue( 'https://wordpress.com/log-in?redirect_to=%2Fsites' );

		await run();

		expect( trackedProps() ).toMatchObject( { redirect_to_login_page: true, magic_login: 1 } );
	} );

	test( 'reports a normal redirect as not pointing at the login page', async () => {
		getRedirectToSanitized.mockReturnValue( '/sites' );

		await run();

		expect( trackedProps() ).toMatchObject( { redirect_to_login_page: false } );
	} );
} );
