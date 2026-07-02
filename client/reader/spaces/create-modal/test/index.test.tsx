/**
 * @jest-environment jsdom
 */
import { readSpaceQuery, readSpacesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { CreateSpaceModal } from '../index';
import type { ReadSpace, ReadSpaceDetails, SiteSubscriptionItem } from '@automattic/api-core';

const mockSubscription: SiteSubscriptionItem = {
	ID: 1,
	URL: 'https://example.com',
	feed_URL: 'https://example.com/feed',
	blog_ID: 123,
	feed_ID: 456,
	name: 'Example Blog',
	site_icon: 'https://example.com/icon.png',
	is_following: true,
};
let mockSubscriptions: SiteSubscriptionItem[] = [];

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useSiteSubscriptions: () => ( {
		subscriptions: mockSubscriptions,
		isLoading: false,
		isError: false,
	} ),
} ) );

// jsdom has no layout, so the real virtualizer would window nothing. Render every
// item so the source rows the tests interact with (Add/Remove) are in the DOM.
jest.mock( 'calypso/reader/hooks/use-infinite-list', () => ( {
	useInfiniteList: ( {
		count,
		getItemKey,
	}: {
		count: number;
		getItemKey: ( index: number ) => string | number;
	} ) => ( {
		getListProps: ( props: { className?: string; style?: React.CSSProperties } = {} ) => ( {
			ref: () => {},
			className: props.className,
			style: props.style ?? {},
		} ),
		items: Array.from( { length: count }, ( _value, index ) => ( {
			index,
			key: String( getItemKey( index ) ),
			start: 0,
		} ) ),
		scrollMargin: 0,
		measureElement: () => {},
		scrollToIndex: () => {},
		scrollToOffset: () => {},
	} ),
} ) );

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

const WORK: ReadSpace = {
	id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
	name: 'Work',
	layout: { color: 'blue', icon: 'inbox' },
};

// Mock the wpcom/v2 create endpoint, echoing the submitted body back so the
// adapted space carries it through to the cache and callbacks.
function mockCreateEndpoint( name: string, onBody?: ( body: Record< string, unknown > ) => void ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/wpcom/v2/reader/spaces' )
		.reply( 201, ( _uri, body: Record< string, unknown > ) => {
			onBody?.( body );
			return {
				id: 7,
				title: name,
				follows: [],
				tags: body.tags ?? [],
				layout: body.layout ?? { color: 'blue', icon: 'inbox' },
			};
		} );
}

function setup( { existing = [] as ReadSpace[], onCreated = jest.fn() } = {} ) {
	const queryClient = new QueryClient();
	queryClient.setQueryData( readSpacesQuery().queryKey, existing );
	const onClose = jest.fn();
	const user = userEvent.setup();
	renderWithProvider( <CreateSpaceModal isOpen onClose={ onClose } onCreated={ onCreated } />, {
		queryClient,
	} );
	return { queryClient, onClose, onCreated, user };
}

describe( 'CreateSpaceModal', () => {
	beforeEach( () => {
		mockSubscriptions = [];
		mockRecordReaderTracksEvent.mockClear();
	} );

	afterEach( () => nock.cleanAll() );

	it( 'renders nothing when closed', () => {
		renderWithProvider( <CreateSpaceModal isOpen={ false } onClose={ jest.fn() } /> );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps Create disabled until a valid name is entered', async () => {
		const { user } = setup();

		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );

		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeEnabled();
	} );

	it( 'uses the shared tabbed upsert modal while creating', async () => {
		mockSubscriptions = [ mockSubscription ];
		const { user } = setup();

		const dialog = screen.getByRole( 'dialog', { name: 'Create a new space' } );

		expect( within( dialog ).getByRole( 'tab', { name: 'Identity' } ) ).toBeVisible();
		expect( within( dialog ).getByRole( 'tab', { name: 'Layout' } ) ).toBeVisible();
		expect( within( dialog ).getByRole( 'tab', { name: 'Sources' } ) ).toBeVisible();
		expect( within( dialog ).queryByRole( 'tab', { name: 'Delete' } ) ).not.toBeInTheDocument();

		await user.click( within( dialog ).getByRole( 'tab', { name: 'Layout' } ) );
		expect( within( dialog ).getByRole( 'radio', { name: /Compact list/ } ) ).toBeChecked();

		await user.click( within( dialog ).getByRole( 'tab', { name: 'Sources' } ) );
		expect(
			within( dialog ).getByText( 'Choose which of your subscriptions appear in this space.' )
		).toBeVisible();
		expect( within( dialog ).getByRole( 'listitem', { name: 'Example Blog' } ) ).toBeVisible();
	} );

	it( 'shows a required error once the name is cleared', async () => {
		const { user } = setup();

		const input = screen.getByLabelText( 'Name' );
		await user.type( input, 'Reading' );
		await user.clear( input );

		expect( await screen.findByText( 'Name is required' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'rejects a name longer than the maximum length', async () => {
		const { user } = setup();

		await user.type( screen.getByLabelText( 'Name' ), 'a'.repeat( 51 ) );

		expect( await screen.findByText( /50 characters or fewer/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'rejects a duplicate name regardless of case', async () => {
		const { user } = setup( { existing: [ WORK ] } );

		await user.type( screen.getByLabelText( 'Name' ), 'work' );

		expect( await screen.findByText( 'A space with this name already exists' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'creates a space with identity and layout settings, updates the caches, and closes', async () => {
		mockSubscriptions = [ mockSubscription ];
		const { user, onClose, queryClient } = setup();
		const onBody = jest.fn();
		mockCreateEndpoint( 'Reading', onBody );

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.click(
			within( screen.getByRole( 'radiogroup', { name: 'Accent color' } ) ).getByRole( 'radio', {
				name: 'Green',
			} )
		);
		await user.click( screen.getByRole( 'radio', { name: 'Star' } ) );
		await user.click( screen.getByRole( 'tab', { name: 'Layout' } ) );
		await user.click( screen.getByRole( 'radio', { name: /Classic/ } ) );
		await user.click( screen.getByRole( 'tab', { name: 'Sources' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Add Example Blog' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				title: 'Reading',
				feeds: [ 456 ],
				tags: [],
				layout: { color: 'green', iconColor: 'blue', icon: 'star', view: 'legacy' },
			} )
		);
		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces ).toEqual( [
			expect.objectContaining( {
				name: 'Reading',
				layout: expect.objectContaining( { color: 'green', icon: 'star', view: 'legacy' } ),
			} ),
		] );
		// The list is the slim summary — sources and tags live only on the detail cache.
		expect( spaces?.[ 0 ] ).not.toHaveProperty( 'sources' );
		expect( spaces?.[ 0 ] ).not.toHaveProperty( 'tags' );
		const detail = queryClient.getQueryData< ReadSpaceDetails >( readSpaceQuery( '7' ).queryKey );
		expect( detail?.layout.view ).toBe( 'legacy' );
		expect( onClose ).toHaveBeenCalled();
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_spaces_space_created',
			{
				tag_count: 0,
				source_count: 1,
				layout: 'legacy',
				icon: 'star',
				color: 'green',
				icon_color: 'blue',
			}
		);
	} );

	it( 'notifies the parent with the created space', async () => {
		const { user, onCreated } = setup();
		mockCreateEndpoint( 'Reading' );

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () =>
			expect( onCreated ).toHaveBeenCalledWith( expect.objectContaining( { name: 'Reading' } ) )
		);
	} );

	it( 'closes without creating when Cancel is clicked', async () => {
		const { user, onClose, queryClient } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onClose ).toHaveBeenCalled();
		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );
} );
