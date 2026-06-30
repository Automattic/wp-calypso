/**
 * @jest-environment jsdom
 */
import { readSpaceQuery, readSpacesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpacesView } from '../view';
import type { ReadSpaceDetails } from '@automattic/api-core';

const mockSpaceFeed = jest.fn< null, [ unknown ] >( () => null );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

// The feed loads a live Reader stream; this view test only covers the header and
// the unified Customize modal, so stub it out to keep the test off the network.
jest.mock( 'calypso/reader/spaces/feed', () => ( {
	SpaceFeed: ( props: unknown ) => mockSpaceFeed( props ),
} ) );

// Keep the rest of the module real (ReaderMain's global handlers use `useFollowSite`);
// only stub the subscriptions list the Sources tab reads.
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	...jest.requireActual( 'calypso/reader/data/site-subscriptions' ),
	useSiteSubscriptions: () => ( { subscriptions: [], isLoading: false, isError: false } ),
} ) );

const WORK: ReadSpaceDetails = {
	id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
	name: 'Work',
	tags: [],
	layout: { color: 'blue', icon: 'inbox', view: 'gallery' },
	sources: [],
};

function render( ui: React.ReactElement ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( readSpacesQuery().queryKey, [ WORK ] );
	queryClient.setQueryData( readSpaceQuery( WORK.id ).queryKey, WORK );

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
	} );

	it( 'shows the Customize button on a space detail page', () => {
		render( <SpacesView id={ WORK.id } /> );

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
		const { unmount } = render( <SpacesView id={ WORK.id } /> );
		expect( screen.getByText( 'Your curated reading space' ) ).toBeVisible();
		unmount();

		render( <SpacesView /> );
		expect( screen.queryByText( 'Your curated reading space' ) ).not.toBeInTheDocument();
	} );

	it( 'does not flash the generic Spaces heading while a specific space is loading', () => {
		// The id is not in the loaded list yet, so the space is still resolving.
		render( <SpacesView id="not-loaded-yet" /> );

		expect( screen.queryByText( 'Spaces' ) ).not.toBeInTheDocument();
	} );

	it( 'passes the space layout view to the feed', () => {
		render( <SpacesView id={ WORK.id } /> );

		expect( mockSpaceFeed ).toHaveBeenCalledWith(
			expect.objectContaining( {
				spaceId: WORK.id,
				layoutView: 'gallery',
			} )
		);
	} );

	it( 'opens the Customize modal on the Identity tab', async () => {
		const user = userEvent.setup();
		render( <SpacesView id={ WORK.id } /> );

		await user.click( screen.getByRole( 'button', { name: 'Customize' } ) );

		const dialog = screen.getByRole( 'dialog', { name: 'Customize space' } );
		expect( within( dialog ).getByLabelText( 'Name' ) ).toHaveValue( 'Work' );
	} );

	it( 'does not open the modal from the route alone', () => {
		render( <SpacesView id={ WORK.id } /> );

		expect( screen.queryByRole( 'dialog', { name: 'Customize space' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows the Feed and Discover sub-navigation on a space detail page', () => {
		render( <SpacesView id={ WORK.id } /> );

		expect( screen.getByRole( 'menuitem', { name: /feed/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /discover/i } ) ).toBeVisible();
	} );

	it( 'renders the feed on the default (feed) tab', () => {
		render( <SpacesView id={ WORK.id } /> );

		expect( mockSpaceFeed ).toHaveBeenCalledTimes( 1 );
		// The feed tab uses the default variant, not Discover.
		expect( mockSpaceFeed ).not.toHaveBeenCalledWith(
			expect.objectContaining( { variant: 'discover' } )
		);
	} );

	it( 'renders the Discover variant of the feed on the discover tab', () => {
		render( <SpacesView id={ WORK.id } tab="discover" /> );

		expect( mockSpaceFeed ).toHaveBeenCalledWith(
			expect.objectContaining( { spaceId: WORK.id, variant: 'discover' } )
		);
	} );
} );
