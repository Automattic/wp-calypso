/**
 * @jest-environment jsdom
 */
import redirectLoggedIn from 'calypso/login/redirect-logged-in/index.web';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
const originalLocation = window.location;

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: jest.fn(),
} ) );

describe( 'redirectLoggedIn', () => {
	let context;
	let next;

	describe( 'when user is logged in', () => {
		beforeEach( () => {
			jest.resetAllMocks();
			isUserLoggedIn.mockReturnValue( true );

			context = {
				store: {
					getState: jest.fn(),
				},
				query: {},
			};
			next = jest.fn();

			Object.defineProperty( window, 'location', {
				value: { assign: jest.fn(), pathname: '', origin: 'https://wordpress.com' },
				writable: true,
			} );
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', originalLocation );
		} );

		test( 'should redirect home when no redirect is passed', () => {
			redirectLoggedIn( { ...context, query: {} }, next );
			expect( window.location ).toBe( '/' );
		} );

		test( 'should redirect home when invalid internal url is passed', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: '////test.com' } }, next );
			expect( window.location ).toBe( '/' );
		} );

		test( 'should redirect according to valid internal redirect_to', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: '/home' } }, next );
			expect( window.location ).toBe( '/home' );
		} );

		test( 'should redirect home when invalid external url is provided', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: 'invalid-external-url' } }, next );
			expect( window.location ).toBe( '/' );
		} );

		test( 'should redirect according to allowed external url', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn(
				{ ...context, query: { redirect_to: 'https://agencies.automattic.com' } },
				next
			);
			expect( window.location ).toBe( 'https://agencies.automattic.com' );
		} );

		test( 'redirects to homepage when not allowed external url is provided', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: 'https://test.com' } }, next );
			expect( window.location ).toBe( '/' );
		} );
	} );
} );
