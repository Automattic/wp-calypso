/**
 * @jest-environment jsdom
 */
import { readSpaceBySlugQuery, readSpaceQuery, readSpacesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpacesView } from '../view';
import type { ReadSpaceDetails } from '@automattic/api-core';

const mockSpaceFeed = jest.fn< null, [ unknown ] >( () => null );
// When set, overrides the by-slug resolution hook's `error` so tests can drive the
// not-available branch; otherwise the real (cache-backed) hook is used.
const mockSpaceError: { current: unknown } = { current: undefined };

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
jest.mock( 'calypso/reader/spaces/feed', () => ( {
	SpaceFeed: ( props: unknown ) => mockSpaceFeed( props ),
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

// Keep the data hooks real (they read the seeded cache, and the Customize modal
// relies on the by-id detail hook); only override the by-slug resolution hook's
// `error` when a test opts in via `mockSpaceError`.
jest.mock( 'calypso/reader/data/spaces', () => {
	const actual = jest.requireActual( 'calypso/reader/data/spaces' );
	return {
		...actual,
		useSpaceBySlug: ( ...args: Parameters< typeof actual.useSpaceBySlug > ) => {
			const result = actual.useSpaceBySlug( ...args );
			return mockSpaceError.current !== undefined
				? { ...result, error: mockSpaceError.current }
				: result;
		},
	};
} );

// Keep the rest of the module real (ReaderMain's global handlers use `useFollowSite`);
// only stub the subscriptions list the Sources tab reads.
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	...jest.requireActual( 'calypso/reader/data/site-subscriptions' ),
	useSiteSubscriptions: () => ( { subscriptions: [], isLoading: false, isError: false } ),
} ) );

const WORK: ReadSpaceDetails = {
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
function seedSpace( queryClient: QueryClient, space: ReadSpaceDetails ) {
	queryClient.setQueryData( readSpacesQuery().queryKey, [ space ] );
	queryClient.setQueryData( readSpaceBySlugQuery( space.slug ).queryKey, space );
	queryClient.setQueryData( readSpaceQuery( space.id ).queryKey, space );
}

function render( ui: React.ReactElement ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	seedSpace( queryClient, WORK );

	return renderWithProvider( ui, {
		queryClient,
		initialState: { currentUser: { id: 1 } },
	} );
}

describe( 'SpacesView', () => {
	// The space sub-navigation (NavTabs) uses IntersectionObserver, absent in jsdom.
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
		window.history.replaceState( {}, '', '/reader/spaces' );
		mockSpaceFeed.mockClear();
		mockRecordReaderTracksEvent.mockClear();
		mockSpaceError.current = undefined;
	} );

	it( 'shows the Customize button on a space detail page', () => {
		render( <SpacesView slug={ WORK.slug } /> );

		expect( screen.getByRole( 'button', { name: 'Customize' } ) ).toBeVisible();
	} );

	it( 'does not show the Customize button on the spaces landing page', () => {
		render( <SpacesView /> );

		expect( screen.queryByRole( 'button', { name: 'Customize' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows the generic Spaces heading on the landing page', () => {
		render( <SpacesView /> );

		expect( screen.getByText( 'Spaces' ) ).toBeVisible();
	} );

	it( 'shows a subtitle under the name on a space detail page but not on the landing page', () => {
		const { unmount } = render( <SpacesView slug={ WORK.slug } /> );
		expect( screen.getByText( 'Your curated reading space' ) ).toBeVisible();
		unmount();

		render( <SpacesView /> );
		expect( screen.queryByText( 'Your curated reading space' ) ).not.toBeInTheDocument();
	} );

	it( 'does not flash the generic Spaces heading while a specific space is loading', () => {
		// This slug isn't cached yet, so the by-slug detail is still resolving.
		render( <SpacesView slug="not-loaded-yet" /> );

		expect( screen.queryByText( 'Spaces' ) ).not.toBeInTheDocument();
	} );

	it( 'passes the resolved space (with its layout view) to the feed', () => {
		render( <SpacesView slug={ WORK.slug } /> );

		expect( mockSpaceFeed ).toHaveBeenCalledWith(
			expect.objectContaining( {
				space: expect.objectContaining( {
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
		queryClient.setQueryData( readSpacesQuery().queryKey, [ WORK ] );

		renderWithProvider( <SpacesView slug={ WORK.slug } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByRole( 'heading', { name: 'Work' } ) ).toBeVisible();
		expect( mockSpaceFeed ).toHaveBeenCalledWith(
			expect.objectContaining( { space: expect.objectContaining( { id: WORK.id } ) } )
		);
	} );

	it( 'renders the wide layout by default when the space has no stored width', () => {
		render( <SpacesView slug={ WORK.slug } /> );

		expect( screen.getByRole( 'main' ) ).toHaveClass( 'is-wide-layout' );
	} );

	it( 'renders the regular (non-wide) layout when the space width is regular', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const regularSpace: ReadSpaceDetails = {
			...WORK,
			layout: { ...WORK.layout, width: 'regular' },
		};
		seedSpace( queryClient, regularSpace );

		renderWithProvider( <SpacesView slug={ regularSpace.slug } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByRole( 'main' ) ).not.toHaveClass( 'is-wide-layout' );
	} );

	it( 'records a page view event with the selected space appearance', async () => {
		render( <SpacesView slug={ WORK.slug } /> );

		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_spaces_page_viewed',
				{
					space_id: WORK.id,
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
		render( <SpacesView slug={ WORK.slug } /> );

		await user.click( screen.getByRole( 'button', { name: 'Customize' } ) );

		const dialog = screen.getByRole( 'dialog', { name: 'Customize space' } );
		expect( within( dialog ).getByLabelText( 'Name' ) ).toHaveValue( 'Work' );
	} );

	it( 'opens the Customize modal on the Feeds tab from the feed Add feeds CTA', async () => {
		render( <SpacesView slug={ WORK.slug } /> );

		// The feed tab's SpaceFeed is wired with the empty-state CTA handler.
		const feedProps = mockSpaceFeed.mock.calls
			.map( ( [ props ] ) => props as { onAddSources?: () => void } )
			.find( ( props ) => typeof props.onAddSources === 'function' );
		act( () => feedProps?.onAddSources?.() );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_spaces_add_sources_clicked',
			{ space_id: WORK.id }
		);

		const dialog = await screen.findByRole( 'dialog', { name: 'Customize space' } );
		expect( within( dialog ).getByRole( 'tab', { name: 'Feeds' } ) ).toHaveAttribute(
			'aria-selected',
			'true'
		);
	} );

	it( 'does not open the modal from the route alone', () => {
		render( <SpacesView slug={ WORK.slug } /> );

		expect( screen.queryByRole( 'dialog', { name: 'Customize space' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows the Feed and Discover sub-navigation on a space detail page', () => {
		render( <SpacesView slug={ WORK.slug } /> );

		expect( screen.getByRole( 'menuitem', { name: /feed/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /discover/i } ) ).toBeVisible();
	} );

	it( 'renders the feed on the default (feed) tab', () => {
		render( <SpacesView slug={ WORK.slug } /> );

		expect( mockSpaceFeed ).toHaveBeenCalledTimes( 1 );
		// The feed tab uses the default variant, not Discover.
		expect( mockSpaceFeed ).not.toHaveBeenCalledWith(
			expect.objectContaining( { variant: 'discover' } )
		);
	} );

	it( 'renders the Discover variant of the feed on the discover tab', () => {
		render( <SpacesView slug={ WORK.slug } tab="discover" /> );

		expect( mockSpaceFeed ).toHaveBeenCalledWith(
			expect.objectContaining( {
				space: expect.objectContaining( { id: WORK.id } ),
				variant: 'discover',
			} )
		);
	} );

	it.each( [ 404, 403 ] )(
		'shows a not-available message and no feed when the space call returns %i',
		( status ) => {
			mockSpaceError.current = wpError( status );

			render( <SpacesView slug="missing" /> );

			expect( screen.getByRole( 'heading', { name: /isn.t available/i } ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Back to Reader' } ) ).toBeVisible();
			expect( mockSpaceFeed ).not.toHaveBeenCalled();
		}
	);

	it( 'records a page error event with the failing status', async () => {
		mockSpaceError.current = wpError( 404 );

		render( <SpacesView slug="missing" /> );

		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_spaces_page_error',
				{ space_slug: 'missing', status: 404 }
			)
		);
	} );

	it( 'keeps rendering the space on a transient (non-4xx) detail error', () => {
		mockSpaceError.current = wpError( 500 );

		render( <SpacesView slug={ WORK.slug } /> );

		expect( screen.queryByRole( 'heading', { name: /isn.t available/i } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Customize' } ) ).toBeVisible();
		expect( mockSpaceFeed ).toHaveBeenCalled();
	} );
} );
