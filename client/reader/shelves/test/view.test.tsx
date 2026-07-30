/**
 * @jest-environment jsdom
 */
import { readShelfBySlugQuery, readShelfQuery, readShelvesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ShelvesView } from '../view';
import type { ReadShelfDetails } from '@automattic/api-core';

const mockShelfFeed = jest.fn< null, [ unknown ] >( () => null );
// When set, overrides the by-slug resolution hook's `error` so tests can drive the
// not-available branch; otherwise the real (cache-backed) hook is used.
const mockShelfError: { current: unknown } = { current: undefined };

// A wpcom-shaped error (an Error with numeric status/statusCode), matching what
// `isWpError` recognizes in production.
const wpError = ( status: number ) =>
	Object.assign( new Error( `HTTP ${ status }` ), { status, statusCode: status } );
const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

// The feed loads a live Reader stream; this view test only covers the header and
// the unified Customize modal, so stub it out to keep the test off the network.
jest.mock( 'calypso/reader/shelves/feed', () => ( {
	ShelfFeed: ( props: unknown ) => mockShelfFeed( props ),
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

// Keep the data hooks real (they read the seeded cache, and the Customize modal
// relies on the by-id detail hook); only override the by-slug resolution hook's
// `error` when a test opts in via `mockShelfError`.
jest.mock( 'calypso/reader/data/shelves', () => {
	const actual = jest.requireActual( 'calypso/reader/data/shelves' );
	return {
		...actual,
		useShelfBySlug: ( ...args: Parameters< typeof actual.useShelfBySlug > ) => {
			const result = actual.useShelfBySlug( ...args );
			if ( mockShelfError.current !== undefined ) {
				return { ...result, error: mockShelfError.current };
			}
			// Tests seed the by-slug cache directly rather than serving the open-time
			// refetch, so present that seeded detail as a settled successful fetch —
			// the Customize modal only seeds its draft once the fetch has succeeded.
			if ( result.data !== undefined ) {
				return { ...result, isSuccess: true, isFetchedAfterMount: true };
			}
			return result;
		},
	};
} );

// Keep the rest of the module real (ReaderMain's global handlers use `useFollowSite`);
// only stub the subscriptions list the Sources tab reads.
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	...jest.requireActual( 'calypso/reader/data/site-subscriptions' ),
	useSiteSubscriptions: () => ( { subscriptions: [], isLoading: false, isError: false } ),
} ) );

const WORK: ReadShelfDetails = {
	id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
	slug: 'work',
	name: 'Work',
	tags: [],
	languages: [],
	layout: { color: 'blue', icon: 'inbox', view: 'gallery' },
	sources: [],
};

// Seed all three caches the view + modal read: the list (sidebar), the by-slug
// detail (how the view resolves its URL), and the by-id detail (the modal).
function seedShelf( queryClient: QueryClient, shelf: ReadShelfDetails ) {
	queryClient.setQueryData( readShelvesQuery().queryKey, [ shelf ] );
	queryClient.setQueryData( readShelfBySlugQuery( shelf.slug ).queryKey, shelf );
	queryClient.setQueryData( readShelfQuery( shelf.id ).queryKey, shelf );
}

function render( ui: React.ReactElement ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	seedShelf( queryClient, WORK );

	return renderWithProvider( ui, {
		queryClient,
		initialState: { currentUser: { id: 1 } },
	} );
}

describe( 'ShelvesView', () => {
	// The shelf sub-navigation (NavTabs) uses IntersectionObserver, absent in jsdom.
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
		window.history.replaceState( {}, '', '/reader/shelves' );
		mockShelfFeed.mockClear();
		mockRecordReaderTracksEvent.mockClear();
		mockShelfError.current = undefined;
	} );

	it( 'shows the Customize button on a shelf detail page', () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		expect( screen.getByRole( 'button', { name: 'Customize' } ) ).toBeVisible();
	} );

	it( 'does not show the Customize button on the shelves landing page', () => {
		render( <ShelvesView /> );

		expect( screen.queryByRole( 'button', { name: 'Customize' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows the generic Shelves heading on the landing page', () => {
		render( <ShelvesView /> );

		expect( screen.getByText( 'Shelves' ) ).toBeVisible();
	} );

	it( 'shows a subtitle under the name on a shelf detail page but not on the landing page', () => {
		const { unmount } = render( <ShelvesView slug={ WORK.slug } /> );
		expect( screen.getByText( 'Your curated reading shelf' ) ).toBeVisible();
		unmount();

		render( <ShelvesView /> );
		expect( screen.queryByText( 'Your curated reading shelf' ) ).not.toBeInTheDocument();
	} );

	it( 'does not flash the generic Shelves heading while a specific shelf is loading', () => {
		// This slug isn't cached yet, so the by-slug detail is still resolving.
		render( <ShelvesView slug="not-loaded-yet" /> );

		expect( screen.queryByText( 'Shelves' ) ).not.toBeInTheDocument();
	} );

	it( 'passes the resolved shelf (with its layout view) to the feed', () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		expect( mockShelfFeed ).toHaveBeenCalledWith(
			expect.objectContaining( {
				shelf: expect.objectContaining( {
					id: WORK.id,
					layout: expect.objectContaining( { view: 'gallery' } ),
				} ),
			} )
		);
	} );

	it( 'paints the header and feed instantly from the list summary before the detail loads', () => {
		// Seed only the list — no by-slug detail cache. The header and feed must still
		// render from the summary rather than waiting on the detail request.
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( readShelvesQuery().queryKey, [ WORK ] );

		renderWithProvider( <ShelvesView slug={ WORK.slug } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByRole( 'heading', { name: 'Work' } ) ).toBeVisible();
		expect( mockShelfFeed ).toHaveBeenCalledWith(
			expect.objectContaining( { shelf: expect.objectContaining( { id: WORK.id } ) } )
		);
	} );

	it( 'renders the wide layout by default when the shelf has no stored width', () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		expect( screen.getByRole( 'main' ) ).toHaveClass( 'is-wide-layout' );
	} );

	it( 'renders the regular (non-wide) layout when the shelf width is regular', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const regularShelf: ReadShelfDetails = {
			...WORK,
			layout: { ...WORK.layout, width: 'regular' },
		};
		seedShelf( queryClient, regularShelf );

		renderWithProvider( <ShelvesView slug={ regularShelf.slug } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByRole( 'main' ) ).not.toHaveClass( 'is-wide-layout' );
	} );

	it( 'records a page view event with the selected shelf appearance', async () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_shelves_page_viewed',
				{
					shelf_id: WORK.id,
					layout: 'gallery',
					icon: 'inbox',
					color: 'blue',
					tab: 'feed',
				}
			)
		);
	} );

	it( 'opens the Customize modal on the Identity tab', async () => {
		const user = userEvent.setup();
		render( <ShelvesView slug={ WORK.slug } /> );

		await user.click( screen.getByRole( 'button', { name: 'Customize' } ) );

		const dialog = screen.getByRole( 'dialog', { name: 'Customize shelf' } );
		expect( within( dialog ).getByLabelText( 'Name' ) ).toHaveValue( 'Work' );
	} );

	it( 'opens the Customize modal on the Feeds tab from the feed Add feeds CTA', async () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		// The feed tab's ShelfFeed is wired with the empty-state CTA handler.
		const feedProps = mockShelfFeed.mock.calls
			.map( ( [ props ] ) => props as { onAddSources?: () => void } )
			.find( ( props ) => typeof props.onAddSources === 'function' );
		act( () => feedProps?.onAddSources?.() );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_shelves_add_sources_clicked',
			{ shelf_id: WORK.id }
		);

		const dialog = await screen.findByRole( 'dialog', { name: 'Customize shelf' } );
		expect( within( dialog ).getByRole( 'tab', { name: 'Feeds' } ) ).toHaveAttribute(
			'aria-selected',
			'true'
		);
	} );

	it( 'does not open the modal from the route alone', () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		expect( screen.queryByRole( 'dialog', { name: 'Customize shelf' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows the Feed and Discover sub-navigation on a shelf detail page', () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		expect( screen.getByRole( 'menuitem', { name: /feed/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /discover/i } ) ).toBeVisible();
	} );

	it( 'renders the feed on the default (feed) tab', () => {
		render( <ShelvesView slug={ WORK.slug } /> );

		expect( mockShelfFeed ).toHaveBeenCalledTimes( 1 );
		// The feed tab uses the default variant, not Discover.
		expect( mockShelfFeed ).not.toHaveBeenCalledWith(
			expect.objectContaining( { variant: 'discover' } )
		);
	} );

	it( 'renders the Discover variant of the feed on the discover tab', () => {
		render( <ShelvesView slug={ WORK.slug } tab="discover" /> );

		expect( mockShelfFeed ).toHaveBeenCalledWith(
			expect.objectContaining( {
				shelf: expect.objectContaining( { id: WORK.id } ),
				variant: 'discover',
			} )
		);
	} );

	it.each( [ 404, 403 ] )(
		'shows a not-available message and no feed when the shelf call returns %i',
		( status ) => {
			mockShelfError.current = wpError( status );

			render( <ShelvesView slug="missing" /> );

			expect( screen.getByRole( 'heading', { name: /isn.t available/i } ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Back to Reader' } ) ).toBeVisible();
			expect( mockShelfFeed ).not.toHaveBeenCalled();
		}
	);

	it( 'records a page error event with the failing status', async () => {
		mockShelfError.current = wpError( 404 );

		render( <ShelvesView slug="missing" /> );

		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_shelves_page_error',
				{ shelf_slug: 'missing', status: 404 }
			)
		);
	} );

	it( 'keeps rendering the shelf on a transient (non-4xx) detail error', () => {
		mockShelfError.current = wpError( 500 );

		render( <ShelvesView slug={ WORK.slug } /> );

		expect( screen.queryByRole( 'heading', { name: /isn.t available/i } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Customize' } ) ).toBeVisible();
		expect( mockShelfFeed ).toHaveBeenCalled();
	} );
} );
