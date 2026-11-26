/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import redirectLoggedInNode from 'calypso/login/redirect-logged-in/index.node';
import redirectLoggedIn from 'calypso/login/redirect-logged-in/index.web';
import { getCurrentUserEmail, isUserLoggedIn } from 'calypso/state/current-user/selectors';
const originalLocation = window.location;

vi.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserEmail: vi.fn(),
	isUserLoggedIn: vi.fn(),
} ) );

describe( 'redirectLoggedIn', () => {
	let context;
	let next;

	describe( 'when user is logged in', () => {
		beforeEach( () => {
			vi.resetAllMocks();
			isUserLoggedIn.mockReturnValue( true );

			context = {
				store: {
					getState: vi.fn(),
				},
				query: {},
			};
			next = vi.fn();

			Object.defineProperty( window, 'location', {
				value: { assign: vi.fn(), pathname: '', origin: 'https://wordpress.com' },
				writable: true,
			} );
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', originalLocation );
		} );

		test( 'should redirect home when no redirect is passed', () => {
			redirectLoggedIn( { ...context, query: {} }, next );
			expect( window.location ).toBe( '/home' );
		} );

		test( 'should redirect home when bare root is passed', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: '/' } }, next );
			expect( window.location ).toBe( '/home' );
		} );

		test( 'should redirect home when bare root carries a query or hash', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: '/?source=magic-login' } }, next );
			expect( window.location ).toBe( '/home' );

			redirectLoggedIn( { ...context, query: { redirect_to: '/#section' } }, next );
			expect( window.location ).toBe( '/home' );
		} );

		test( 'should redirect home when invalid internal url is passed', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: '////test.com' } }, next );
			expect( window.location ).toBe( '/home' );
		} );

		test( 'should redirect according to valid internal redirect_to', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: '/home' } }, next );
			expect( window.location ).toBe( '/home' );
		} );

		test( 'should redirect home when invalid external url is provided', () => {
			isUserLoggedIn.mockReturnValue( true );
			redirectLoggedIn( { ...context, query: { redirect_to: 'invalid-external-url' } }, next );
			expect( window.location ).toBe( '/home' );
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
			expect( window.location ).toBe( '/home' );
		} );

		test( 'calls next without redirecting for a confirm-subscription link targeting a different email', () => {
			getCurrentUserEmail.mockReturnValue( 'alice@example.com' );
			const initialLocation = window.location;

			redirectLoggedIn(
				{
					...context,
					query: {
						email: 'bob@example.com',
						redirect_to: 'https://subscribe.wordpress.com/?email=bob%40example.com&activate=abc123',
					},
				},
				next
			);

			expect( next ).toHaveBeenCalledTimes( 1 );
			expect( window.location ).toBe( initialLocation );
		} );

		test( 'redirects to subscribe.wordpress.com when the confirm-subscription email matches the logged-in user', () => {
			getCurrentUserEmail.mockReturnValue( 'Alice@Example.com' );
			const redirectTo =
				'https://subscribe.wordpress.com/?email=alice%40example.com&activate=abc123';

			redirectLoggedIn(
				{
					...context,
					query: {
						email: 'alice@example.com',
						redirect_to: redirectTo,
					},
				},
				next
			);

			expect( next ).not.toHaveBeenCalled();
			expect( window.location ).toBe( redirectTo );
		} );

		test( 'calls next without redirecting when confirm-subscription params are in context.state', () => {
			getCurrentUserEmail.mockReturnValue( 'alice@example.com' );
			const initialLocation = window.location;

			redirectLoggedIn(
				{
					...context,
					querystring: '',
					query: {},
					state: {
						email: 'bob@example.com',
						redirect_to: 'https://subscribe.wordpress.com/?email=bob%40example.com&activate=abc123',
					},
				},
				next
			);

			expect( next ).toHaveBeenCalledTimes( 1 );
			expect( window.location ).toBe( initialLocation );
		} );

		test( 'uses the email inside redirect_to when top-level email param is absent', () => {
			getCurrentUserEmail.mockReturnValue( 'alice@example.com' );
			const initialLocation = window.location;

			redirectLoggedIn(
				{
					...context,
					query: {
						redirect_to: 'https://subscribe.wordpress.com/?email=bob%40example.com&activate=abc123',
					},
				},
				next
			);

			expect( next ).toHaveBeenCalledTimes( 1 );
			expect( window.location ).toBe( initialLocation );
		} );

		test( 'redirects when subscribe.wordpress.com redirect_to has no activate parameter', () => {
			getCurrentUserEmail.mockReturnValue( 'alice@example.com' );
			const redirectTo = 'https://subscribe.wordpress.com/?email=bob%40example.com';

			redirectLoggedIn(
				{
					...context,
					query: {
						email: 'bob@example.com',
						redirect_to: redirectTo,
					},
				},
				next
			);

			expect( next ).not.toHaveBeenCalled();
			expect( window.location ).toBe( redirectTo );
		} );
	} );
} );

describe( 'redirectLoggedIn (node)', () => {
	test( 'calls next without redirecting for a confirm-subscription link', () => {
		const res = { redirect: vi.fn() };
		const next = vi.fn();

		redirectLoggedInNode(
			{
				isLoggedIn: true,
				query: {
					redirect_to: 'https://subscribe.wordpress.com/?email=bob%40example.com&activate=abc123',
				},
				res,
			},
			next
		);

		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( res.redirect ).not.toHaveBeenCalled();
	} );

	test( 'redirects logged-in requests to /home for non-subscription links', () => {
		const res = { redirect: vi.fn() };
		const next = vi.fn();

		redirectLoggedInNode(
			{
				isLoggedIn: true,
				query: { redirect_to: 'https://wordpress.com/read' },
				res,
			},
			next
		);

		expect( res.redirect ).toHaveBeenCalledWith( '/home' );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
