/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonTagFeedTabs, useMastodonTagFilter } from '../tag-feed-tabs';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );

const replace = page.replace as jest.Mock;

function setLocation( search: string ) {
	window.history.replaceState( {}, '', '/reader/mastodon/7/tag/rust' + search );
}

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
	jest
		.spyOn( analytics, 'recordReaderTracksEvent' )
		.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	setLocation( '' );
} );

afterEach( () => jest.restoreAllMocks() );

describe( 'useMastodonTagFilter', () => {
	it( 'returns "all" when ?tab is absent', () => {
		setLocation( '' );
		const { result } = renderHook( () => useMastodonTagFilter() );
		expect( result.current ).toBe( 'all' );
	} );

	it( 'maps ?tab=media to "media"', () => {
		setLocation( '?tab=media' );
		const { result } = renderHook( () => useMastodonTagFilter() );
		expect( result.current ).toBe( 'media' );
	} );

	it( 'maps ?tab=local to "local"', () => {
		setLocation( '?tab=local' );
		const { result } = renderHook( () => useMastodonTagFilter() );
		expect( result.current ).toBe( 'local' );
	} );

	it( 'falls back to "all" on a malformed slug', () => {
		setLocation( '?tab=garbage' );
		const { result } = renderHook( () => useMastodonTagFilter() );
		expect( result.current ).toBe( 'all' );
	} );
} );

describe( 'MastodonTagFeedTabs', () => {
	function renderTabs( props: Partial< React.ComponentProps< typeof MastodonTagFeedTabs > > = {} ) {
		return renderWithProvider(
			<MastodonTagFeedTabs connectionId={ 7 } hashtag="rust" activeFilter="all" { ...props } />
		);
	}

	it( 'renders three tabs labeled All, Media, Local', () => {
		renderTabs();
		expect( screen.getByRole( 'menuitem', { name: 'All' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Local' } ) ).toBeVisible();
	} );

	it( 'tabs anchor to the per-filter URL via href', () => {
		renderTabs();
		expect( screen.getByRole( 'menuitem', { name: 'All' } ) ).toHaveAttribute(
			'href',
			'/reader/mastodon/7/tag/rust?tab=all'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toHaveAttribute(
			'href',
			'/reader/mastodon/7/tag/rust?tab=media'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Local' } ) ).toHaveAttribute(
			'href',
			'/reader/mastodon/7/tag/rust?tab=local'
		);
	} );

	it( 'plain-clicking a non-active tab navigates and dispatches _tag_filter_changed', async () => {
		const user = userEvent.setup();
		renderTabs( { activeFilter: 'all' } );

		await user.click( screen.getByRole( 'menuitem', { name: 'Media' } ) );

		expect( replace ).toHaveBeenCalledWith( '/reader/mastodon/7/tag/rust?tab=media' );
		expect( analytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_tag_filter_changed',
			{
				connection_id: 7,
				hashtag: 'rust',
				from_filter: 'all',
				to_filter: 'media',
			}
		);
	} );

	it( 'clicking the already-active tab is a no-op', async () => {
		const user = userEvent.setup();
		renderTabs( { activeFilter: 'all' } );

		await user.click( screen.getByRole( 'menuitem', { name: 'All' } ) );

		expect( replace ).not.toHaveBeenCalled();
		expect( analytics.recordReaderTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'percent-encodes the hashtag in tab paths', () => {
		renderTabs( { hashtag: 'foo bar' } );
		expect( screen.getByRole( 'menuitem', { name: 'All' } ) ).toHaveAttribute(
			'href',
			'/reader/mastodon/7/tag/foo%20bar?tab=all'
		);
	} );
} );
