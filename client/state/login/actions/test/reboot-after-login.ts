/**
 * @jest-environment jsdom
 */
import { rebootAfterLogin } from 'calypso/state/login/actions/reboot-after-login';

const originalLocation = window.location;

jest.mock( 'calypso/lib/user/store', () => ( {
	clearStore: jest.fn().mockResolvedValue( undefined ),
	getStoredUserId: jest.fn().mockReturnValue( null ),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEventWithClientId: () => () => {},
} ) );

describe( 'rebootAfterLogin', () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { href: '' },
			writable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
		} );
	} );

	function makeGetState( {
		sanitized = null,
		original = null,
	}: {
		sanitized?: string | null;
		original?: string | null;
	} ) {
		return () => ( {
			login: {
				twoFactorAuth: {},
				redirectTo: { sanitized, original },
			},
		} );
	}

	test( 'redirects to sanitized URL when available', async () => {
		const dispatch = jest.fn();
		const getState = makeGetState( { sanitized: 'https://wordpress.com/home' } );

		await rebootAfterLogin( {} )( dispatch, getState );
		expect( window.location.href ).toBe( 'https://wordpress.com/home' );
	} );

	test( 'falls back to original redirect_to when sanitized is null', async () => {
		const dispatch = jest.fn();
		const getState = makeGetState( {
			sanitized: null,
			original: 'https://testp2p2.wordpress.com/',
		} );

		await rebootAfterLogin( {} )( dispatch, getState );
		expect( window.location.href ).toBe( 'https://testp2p2.wordpress.com/' );
	} );

	test( 'redirects to / when both sanitized and original are null', async () => {
		const dispatch = jest.fn();
		const getState = makeGetState( { sanitized: null, original: null } );

		await rebootAfterLogin( {} )( dispatch, getState );
		expect( window.location.href ).toBe( '/' );
	} );

	test( 'prefers sanitized over original when both are set', async () => {
		const dispatch = jest.fn();
		const getState = makeGetState( {
			sanitized: 'https://wordpress.com/home',
			original: 'https://testp2p2.wordpress.com/',
		} );

		await rebootAfterLogin( {} )( dispatch, getState );
		expect( window.location.href ).toBe( 'https://wordpress.com/home' );
	} );
} );
