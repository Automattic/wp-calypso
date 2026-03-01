/**
 * @jest-environment jsdom
 */
import { rebootAfterLogin } from 'calypso/state/login/actions/reboot-after-login';
import { getRedirectToSanitized } from 'calypso/state/login/selectors';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEventWithClientId: () => ( { type: 'MOCK_TRACKS' } ),
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

	beforeEach( () => {
		jest.clearAllMocks();
		dispatch = jest.fn( ( action ) => {
			if ( typeof action === 'function' ) {
				return action( dispatch, getState );
			}
			return action;
		} );
		getState = jest.fn( () => ( {} ) );

		Object.defineProperty( window, 'location', {
			value: { href: '', origin: 'https://wordpress.com' },
			writable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	test( 'should redirect to / when no sanitized redirect is available', async () => {
		getRedirectToSanitized.mockReturnValue( null );

		await rebootAfterLogin( {} )( dispatch, getState );

		expect( window.location.href ).toBe( '/' );
	} );

	test( 'should redirect to the sanitized redirect url', async () => {
		getRedirectToSanitized.mockReturnValue( 'https://wordpress.com/home' );

		await rebootAfterLogin( {} )( dispatch, getState );

		expect( window.location.href ).toBe( 'https://wordpress.com/home' );
	} );

	test( 'should redirect to / when sanitized redirect points to /log-in', async () => {
		getRedirectToSanitized.mockReturnValue(
			'https://wordpress.com/log-in/?redirect_to=https%3A%2F%2Fmysite.wordpress.com%2Fwp-login.php%3Faction%3Djetpack-sso'
		);

		await rebootAfterLogin( {} )( dispatch, getState );

		expect( window.location.href ).toBe( '/' );
	} );

	test( 'should redirect to / for relative /log-in paths', async () => {
		getRedirectToSanitized.mockReturnValue(
			'/log-in/?redirect_to=https%3A%2F%2Fexample.wordpress.com%2Fwp-admin%2F'
		);

		await rebootAfterLogin( {} )( dispatch, getState );

		expect( window.location.href ).toBe( '/' );
	} );

	test( 'should redirect to / for bare /log-in with no redirect_to', async () => {
		getRedirectToSanitized.mockReturnValue( 'https://wordpress.com/log-in/' );

		await rebootAfterLogin( {} )( dispatch, getState );

		expect( window.location.href ).toBe( '/' );
	} );

	test( 'should not redirect to / for non-login paths', async () => {
		getRedirectToSanitized.mockReturnValue(
			'https://wordpress.com/checkout/?redirect_to=https%3A%2F%2Fexample.com'
		);

		await rebootAfterLogin( {} )( dispatch, getState );

		expect( window.location.href ).toBe(
			'https://wordpress.com/checkout/?redirect_to=https%3A%2F%2Fexample.com'
		);
	} );

	test( 'should append login_flow param for oauth2/authorize urls', async () => {
		getRedirectToSanitized.mockReturnValue(
			'https://public-api.wordpress.com/oauth2/authorize?client_id=123'
		);

		await rebootAfterLogin( {} )( dispatch, getState );

		expect( window.location.href ).toBe(
			'https://public-api.wordpress.com/oauth2/authorize?client_id=123&login_flow=true'
		);
	} );
} );
