/**
 * @jest-environment jsdom
 */
import { readSpaceQuery, readSpacesQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { CustomizeModal } from '../index';
import type { ReadSpace, ReadSpaceDetails, SiteSubscriptionItem } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { replace: jest.fn() } ),
} ) );

const existingSubscription: SiteSubscriptionItem = {
	ID: 1,
	URL: 'https://existing.example',
	feed_URL: 'https://existing.example/feed',
	blog_ID: 123,
	feed_ID: 456,
	name: 'Existing Blog',
	site_icon: 'https://existing.example/icon.png',
	is_following: true,
};

const newSubscription: SiteSubscriptionItem = {
	ID: 2,
	URL: 'https://new.example',
	feed_URL: 'https://new.example/feed',
	blog_ID: 234,
	feed_ID: 789,
	name: 'New Blog',
	site_icon: 'https://new.example/icon.png',
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

const SPACE: ReadSpaceDetails = {
	id: '7',
	name: 'Work',
	tags: [ 'tech' ],
	layout: { color: 'blue', icon: 'inbox', view: 'standard-list' },
	sources: [],
};

// Echo the submitted fields back so the adapted detail reflects the edit.
function mockUpdateEndpoint( onBody?: ( body: Record< string, unknown > ) => void ) {
	return nock( 'https://public-api.wordpress.com' )
		.put( '/wpcom/v2/reader/spaces/7' )
		.reply( 200, ( _uri, body: Record< string, unknown > ) => {
			onBody?.( body );
			return {
				id: 7,
				title: body.title ?? SPACE.name,
				layout: body.layout ?? SPACE.layout,
				follows: [],
				tags: body.tags ?? SPACE.tags,
			};
		} );
}

function mockDeleteEndpoint() {
	return nock( 'https://public-api.wordpress.com' )
		.delete( '/wpcom/v2/reader/spaces/7' )
		.reply( 200, { deleted: true, id: 7 } );
}

function render( {
	others = [] as ReadSpace[],
	onClose = jest.fn(),
	space = SPACE,
}: {
	others?: ReadSpace[];
	onClose?: jest.Mock;
	space?: ReadSpaceDetails;
} = {} ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const { sources, tags, ...summary } = space;
	queryClient.setQueryData( readSpacesQuery().queryKey, [ summary, ...others ] );
	queryClient.setQueryData( readSpaceQuery( space.id ).queryKey, space );

	const view = renderWithProvider(
		<CustomizeModal isOpen spaceId={ space.id } onClose={ onClose } />,
		{
			queryClient,
			initialState: { currentUser: { id: 1 } },
		}
	);
	return { ...view, queryClient, onClose };
}

describe( 'CustomizeModal', () => {
	beforeEach( () => {
		mockSubscriptions = [];
	} );

	afterEach( () => nock.cleanAll() );

	it( 'seeds the identity fields from the space detail', () => {
		render();

		expect( screen.getByLabelText( 'Name' ) ).toHaveValue( 'Work' );
		expect( screen.getByRole( 'radio', { name: 'Blue' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Inbox' } ) ).toBeChecked();
	} );

	it( 'switches between the Identity, Layout and Sources tabs', async () => {
		const user = userEvent.setup();
		render();

		expect( screen.getByRole( 'tab', { name: 'Delete' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Delete space' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'tab', { name: 'Layout' } ) );
		expect( screen.getByRole( 'radio', { name: /Compact list/ } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: /Legacy/ } ) ).toBeVisible();

		await user.click( screen.getByRole( 'tab', { name: 'Sources' } ) );
		expect(
			screen.getByText( 'Choose which of your subscriptions appear in this space.' )
		).toBeVisible();

		await user.click( screen.getByRole( 'tab', { name: 'Delete' } ) );
		expect( screen.getByRole( 'button', { name: 'Delete space' } ) ).toBeVisible();
	} );

	it( 'saves edited identity and layout, then closes', async () => {
		const user = userEvent.setup();
		const { queryClient, onClose } = render();
		const onBody = jest.fn();
		mockUpdateEndpoint( onBody );

		const name = screen.getByLabelText( 'Name' );
		await user.clear( name );
		await user.type( name, 'Reading' );
		await user.click( screen.getByRole( 'radio', { name: 'Green' } ) );

		await user.click( screen.getByRole( 'tab', { name: 'Layout' } ) );
		await user.click( screen.getByRole( 'radio', { name: /Legacy/ } ) );

		await user.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				title: 'Reading',
				tags: [ 'tech' ],
				layout: { color: 'green', icon: 'inbox', view: 'legacy' },
			} )
		);
		const cached = queryClient.getQueryData< ReadSpaceDetails >(
			readSpaceQuery( SPACE.id ).queryKey
		);
		expect( cached?.name ).toBe( 'Reading' );
		expect( cached?.layout.color ).toBe( 'green' );
		expect( cached?.layout.view ).toBe( 'legacy' );
	} );

	it( 'saves source changes with the rest of the edit draft', async () => {
		mockSubscriptions = [ existingSubscription, newSubscription ];
		const user = userEvent.setup();
		const { onClose } = render( {
			space: {
				...SPACE,
				sources: [
					{
						feedId: 456,
						feedUrl: 'https://existing.example/feed',
						blogId: 123,
						name: 'Existing Blog',
						siteIcon: null,
					},
				],
			},
		} );
		const onBody = jest.fn();
		mockUpdateEndpoint( onBody );

		await user.click( screen.getByRole( 'tab', { name: 'Sources' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Remove Existing Blog' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Add New Blog' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				feeds: [ 789 ],
			} )
		);
	} );

	it( 'keeps unsaved identity edits when a source is changed (seeds the draft once)', async () => {
		mockSubscriptions = [ existingSubscription, newSubscription ];
		const user = userEvent.setup();
		const { onClose } = render( {
			space: {
				...SPACE,
				sources: [
					{
						feedId: 456,
						feedUrl: 'https://existing.example/feed',
						blogId: 123,
						name: 'Existing Blog',
						siteIcon: null,
					},
				],
			},
		} );
		const onBody = jest.fn();
		mockUpdateEndpoint( onBody );

		// Edit the name first...
		const name = screen.getByLabelText( 'Name' );
		await user.clear( name );
		await user.type( name, 'Reading' );

		// ...then toggle a source on another tab. This must not re-seed the draft and
		// wipe the pending name edit.
		await user.click( screen.getByRole( 'tab', { name: 'Sources' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Add New Blog' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				title: 'Reading',
				feeds: [ 456, 789 ],
			} )
		);
	} );

	it( 'allows keeping the current name but blocks a name that collides with another space', async () => {
		const user = userEvent.setup();
		render( { others: [ { id: '9', name: 'Reading', layout: { color: 'red', icon: 'box' } } ] } );

		// The unchanged own name is valid.
		expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeEnabled();

		const name = screen.getByLabelText( 'Name' );
		await user.clear( name );
		await user.type( name, 'Reading' );

		expect( await screen.findByText( 'A space with this name already exists' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeDisabled();
	} );

	it( 'deletes the space after confirming, then navigates away and closes', async () => {
		const user = userEvent.setup();
		const { queryClient, onClose } = render();
		mockDeleteEndpoint();

		await user.click( screen.getByRole( 'tab', { name: 'Delete' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Delete space' } ) );

		const dialog = screen.getByRole( 'dialog', { name: 'Delete space' } );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Delete space' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( page ).toHaveBeenCalledWith( '/reader/spaces' );
		const list = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( list ).toEqual( [] );
	} );
} );
