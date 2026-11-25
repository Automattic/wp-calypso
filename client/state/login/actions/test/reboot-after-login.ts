/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { rebootAfterLogin } from '../reboot-after-login';

vi.mock( 'calypso/lib/user/store', () => ( {
	clearStore: vi.fn(),
	getStoredUserId: () => null,
} ) );

Object.defineProperty( window, 'location', { value: { href: '' } } );

const reboot = async ( sanitizedRedirectTo: string | null ) => {
	const getState = () => ( { login: { redirectTo: { sanitized: sanitizedRedirectTo } } } );
	await rebootAfterLogin( {} )( vi.fn(), getState );
	return window.location.href;
};

describe( 'rebootAfterLogin', () => {
	it( 'marks a post on a WordPress.com site so iOS keeps it in the browser', async () => {
		expect( await reboot( 'https://example.wordpress.com/2024/05/01/my-post/#comment-55' ) ).toBe(
			'https://example.wordpress.com/2024/05/01/my-post/?open_in_browser=1#comment-55'
		);
	} );

	it( 'falls back to /home without a redirect', async () => {
		expect( await reboot( null ) ).toBe( '/home' );
	} );

	it( 'flags an OAuth authorize redirect as coming from the login flow', async () => {
		expect(
			await reboot( 'https://public-api.wordpress.com/oauth2/authorize?client_id=123' )
		).toBe( 'https://public-api.wordpress.com/oauth2/authorize?client_id=123&login_flow=true' );
	} );
} );
