/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AuthorProfileTabs, useAuthorProfileFilter } from '../author-profile-tabs';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: {
		replace: jest.fn(),
		show: jest.fn(),
	},
} ) );

const replace = page.replace as jest.Mock;
const showFn = page.show as jest.Mock;

function setLocation( search: string ) {
	window.history.replaceState( {}, '', '/reader/atmosphere/42/profile/alice.bsky.social' + search );
}

// NavTabs uses IntersectionObserver which jsdom does not provide.
beforeAll( () => {
	global.IntersectionObserver = class IntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof global.IntersectionObserver;
} );

afterAll( () => {
	// @ts-expect-error -- cleaning up the stub
	delete global.IntersectionObserver;
} );

beforeEach( () => {
	replace.mockReset();
	showFn.mockReset();
	jest
		.spyOn( analytics, 'recordReaderTracksEvent' )
		.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	setLocation( '' );
} );

afterEach( () => {
	jest.restoreAllMocks();
} );

describe( 'useAuthorProfileFilter', () => {
	it( 'returns posts_no_replies when ?tab is absent', () => {
		setLocation( '' );
		const { result } = renderHook( () => useAuthorProfileFilter() );
		expect( result.current ).toBe( 'posts_no_replies' );
		expect( replace ).not.toHaveBeenCalled();
	} );

	it( 'maps ?tab=replies to posts_with_replies', () => {
		setLocation( '?tab=replies' );
		const { result } = renderHook( () => useAuthorProfileFilter() );
		expect( result.current ).toBe( 'posts_with_replies' );
		expect( replace ).not.toHaveBeenCalled();
	} );

	it( 'maps ?tab=media to posts_with_media', () => {
		setLocation( '?tab=media' );
		const { result } = renderHook( () => useAuthorProfileFilter() );
		expect( result.current ).toBe( 'posts_with_media' );
		expect( replace ).not.toHaveBeenCalled();
	} );

	it( 'rewrites a malformed ?tab once and returns the default filter', () => {
		setLocation( '?tab=garbage' );
		const { rerender, result } = renderHook( () => useAuthorProfileFilter() );
		expect( result.current ).toBe( 'posts_no_replies' );
		expect( replace ).toHaveBeenCalledTimes( 1 );
		expect( replace ).toHaveBeenCalledWith( expect.stringMatching( /\?tab=posts$/ ) );

		// A subsequent render with the same malformed URL must not call replace again.
		rerender();
		expect( replace ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'rewrites again if a malformed value reappears after a valid value', () => {
		setLocation( '?tab=garbage' );
		const { rerender, result } = renderHook( () => useAuthorProfileFilter() );
		expect( replace ).toHaveBeenCalledTimes( 1 );
		expect( result.current ).toBe( 'posts_no_replies' );

		// User navigates to a valid tab — the ref clears.
		setLocation( '?tab=replies' );
		rerender();
		expect( replace ).toHaveBeenCalledTimes( 1 );
		expect( result.current ).toBe( 'posts_with_replies' );

		// A new malformed value should re-trigger the rewrite.
		setLocation( '?tab=garbage2' );
		rerender();
		expect( replace ).toHaveBeenCalledTimes( 2 );
		expect( replace ).toHaveBeenLastCalledWith( expect.stringMatching( /\?tab=posts$/ ) );
		expect( result.current ).toBe( 'posts_no_replies' );
	} );

	it( 'maps ?tab=posts to posts_no_replies', () => {
		setLocation( '?tab=posts' );
		const { result } = renderHook( () => useAuthorProfileFilter() );
		expect( result.current ).toBe( 'posts_no_replies' );
		expect( replace ).not.toHaveBeenCalled();
	} );
} );

describe( 'AuthorProfileTabs', () => {
	function renderTabs( props: Partial< React.ComponentProps< typeof AuthorProfileTabs > > = {} ) {
		return renderWithProvider(
			<AuthorProfileTabs
				connectionId={ 42 }
				actor="alice.bsky.social"
				basePath="/reader/atmosphere/42/profile/alice.bsky.social"
				activeFilter="posts_no_replies"
				{ ...props }
			/>
		);
	}

	it( 'renders three tabs labeled Posts, Replies, and Media', () => {
		renderTabs();
		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Replies' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toBeVisible();
	} );

	it( 'marks the activeFilter tab as selected', () => {
		renderTabs( { activeFilter: 'posts_with_replies' } );
		const repliesTab = screen.getByRole( 'menuitem', { name: 'Replies' } );
		expect( repliesTab.closest( 'li' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'tabs anchor to the per-filter URL via href', () => {
		renderTabs();
		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile/alice.bsky.social?tab=posts'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Replies' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile/alice.bsky.social?tab=replies'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile/alice.bsky.social?tab=media'
		);
	} );

	it( 'plain-clicking a non-active tab calls page.replace and dispatches _filter_changed', async () => {
		const user = userEvent.setup();
		renderTabs( { activeFilter: 'posts_no_replies' } );

		await user.click( screen.getByRole( 'menuitem', { name: 'Replies' } ) );

		expect( replace ).toHaveBeenCalledTimes( 1 );
		expect( replace ).toHaveBeenCalledWith(
			'/reader/atmosphere/42/profile/alice.bsky.social?tab=replies'
		);
		expect( showFn ).not.toHaveBeenCalled();
		expect( analytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_profile_filter_changed',
			{
				connection_id: 42,
				actor: 'alice.bsky.social',
				from_filter: 'posts_no_replies',
				to_filter: 'posts_with_replies',
			}
		);
	} );

	it( 'clicking the already-active tab is a no-op', async () => {
		const user = userEvent.setup();
		renderTabs( { activeFilter: 'posts_no_replies' } );

		await user.click( screen.getByRole( 'menuitem', { name: 'Posts' } ) );

		expect( replace ).not.toHaveBeenCalled();
		expect( analytics.recordReaderTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'falls back to Posts when activeFilter is the un-tabbed posts_and_author_threads value', () => {
		renderTabs( { activeFilter: 'posts_and_author_threads' } );
		// All three tabs render and the Posts tab is shown as selected.
		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Replies' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toBeVisible();
		const postsTab = screen.getByRole( 'menuitem', { name: 'Posts' } );
		expect( postsTab.closest( 'li' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'builds tab hrefs from basePath alone (no actor segment)', () => {
		renderTabs( { basePath: '/reader/atmosphere/42/profile' } );
		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile?tab=posts'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Replies' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile?tab=replies'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile?tab=media'
		);
	} );

	it( 'modifier-click does not call preventDefault — native browser handling kicks in', async () => {
		renderTabs( { activeFilter: 'posts_no_replies' } );
		const repliesLink = screen.getByRole( 'menuitem', { name: 'Replies' } );

		// Build a click event that we control so we can assert on defaultPrevented.
		const event = new MouseEvent( 'click', {
			bubbles: true,
			cancelable: true,
			button: 0,
			metaKey: true,
		} );
		repliesLink.dispatchEvent( event );

		expect( event.defaultPrevented ).toBe( false );
		expect( replace ).not.toHaveBeenCalled();
		expect( analytics.recordReaderTracksEvent ).not.toHaveBeenCalled();
	} );
} );
