/**
 * @jest-environment jsdom
 */
import { readSpaceBySlugQuery, readSpaceQuery, readSpacesQuery } from '@automattic/api-queries';
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

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
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
	slug: 'work',
	name: 'Work',
	tags: [ 'tech' ],
	languages: [ 'en' ],
	layout: { color: 'blue', icon: 'inbox', view: 'standard-list' },
	sources: [],
};

// Echo the submitted fields back so the adapted detail reflects the edit.
function mockUpdateEndpoint( onBody?: ( body: Record< string, unknown > ) => void ) {
	return nock( 'https://public-api.wordpress.com' )
		.put( '/wpcom/v2/reader/spaces/7' )
		.reply( 200, ( _uri, body: Record< string, unknown > ) => {
			onBody?.( body );
			const title = body.title ?? SPACE.name;
			return {
				id: 7,
				// The server re-derives the slug from the title, so echo that here.
				slug: String( title ).toLowerCase().replace( /\s+/g, '-' ),
				title,
				layout: body.layout ?? SPACE.layout,
				follows: [],
				tags: body.tags ?? SPACE.tags,
				languages: body.languages ?? SPACE.languages,
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
	// The modal resolves the space by slug (sharing the view's cache); the id-keyed
	// entry is what the mutations write back to.
	queryClient.setQueryData( readSpaceBySlugQuery( space.slug ).queryKey, space );
	queryClient.setQueryData( readSpaceQuery( space.id ).queryKey, space );

	const view = renderWithProvider(
		<CustomizeModal isOpen slug={ space.slug } onClose={ onClose } />,
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
		mockRecordReaderTracksEvent.mockClear();
		jest.mocked( page ).mockClear();
		jest.mocked( page.replace ).mockClear();
	} );

	afterEach( () => nock.cleanAll() );

	it( 'seeds the identity fields from the space detail', () => {
		render();

		expect( screen.getByLabelText( 'Name' ) ).toHaveValue( 'Work' );
		// The saved language base code is shown by its display name.
		expect( screen.getByText( 'English' ) ).toBeVisible();
		expect(
			within( screen.getByRole( 'radiogroup', { name: 'Accent color' } ) ).getByRole( 'radio', {
				name: 'Blue',
			} )
		).toBeChecked();
		expect(
			screen.getByText( 'Changes the color of post titles and actions in this space.' )
		).toBeVisible();
		expect( screen.getByRole( 'radio', { name: 'Inbox' } ) ).toBeChecked();
	} );

	it( 'shows the accent color picker after the icon controls', () => {
		render();

		const iconLabel = screen.getByText( 'Icon' );
		const iconColorLabel = screen.getByText( 'Icon color' );
		const accentColorLabel = screen.getByText( 'Accent color' );

		expect(
			iconLabel.compareDocumentPosition( iconColorLabel ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			iconColorLabel.compareDocumentPosition( accentColorLabel ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'switches between the Identity, Layout and Sources tabs', async () => {
		const user = userEvent.setup();
		render();

		expect( screen.getByRole( 'tab', { name: 'Delete' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Delete space' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'tab', { name: 'Layout' } ) );
		expect( screen.getByRole( 'radio', { name: /Compact list/ } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: /Classic/ } ) ).toBeVisible();

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
		await user.click(
			within( screen.getByRole( 'radiogroup', { name: 'Accent color' } ) ).getByRole( 'radio', {
				name: 'Green',
			} )
		);

		await user.click( screen.getByRole( 'tab', { name: 'Layout' } ) );
		await user.click( screen.getByRole( 'radio', { name: /Classic/ } ) );

		await user.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				title: 'Reading',
				tags: [ 'tech' ],
				// The seeded language is carried through unchanged on save.
				languages: [ 'en' ],
				layout: { color: 'green', iconColor: 'blue', icon: 'inbox', view: 'legacy', width: 'wide' },
			} )
		);
		const cached = queryClient.getQueryData< ReadSpaceDetails >(
			readSpaceQuery( SPACE.id ).queryKey
		);
		expect( cached?.name ).toBe( 'Reading' );
		expect( cached?.layout.color ).toBe( 'green' );
		expect( cached?.layout.view ).toBe( 'legacy' );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_spaces_space_updated',
			{ tag_count: 1, language_count: 1, source_count: 0, layout: 'legacy' }
		);
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_spaces_layout_changed',
			{ layout: 'legacy' }
		);
		// The rename changed the slug, so the URL is canonicalized to the new one.
		expect( page.replace ).toHaveBeenCalledWith( '/reader/spaces/reading' );
	} );

	it( 'does not redirect when a save leaves the name (and slug) unchanged', async () => {
		const user = userEvent.setup();
		const { onClose } = render();
		mockUpdateEndpoint();

		// Change only the accent colour; the name — and therefore the slug — is unchanged.
		await user.click(
			within( screen.getByRole( 'radiogroup', { name: 'Accent color' } ) ).getByRole( 'radio', {
				name: 'Green',
			} )
		);
		await user.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'defaults an unset width to Wide and lets the user switch to Regular', async () => {
		const user = userEvent.setup();
		const { onClose } = render();
		const onBody = jest.fn();
		mockUpdateEndpoint( onBody );

		await user.click( screen.getByRole( 'tab', { name: 'Layout' } ) );

		const widthGroup = screen.getByRole( 'radiogroup', { name: 'Width' } );
		// The space has no stored width, so it seeds to the Wide default.
		expect( within( widthGroup ).getByRole( 'radio', { name: /Wide/ } ) ).toBeChecked();
		expect( within( widthGroup ).getByRole( 'radio', { name: /Regular/ } ) ).not.toBeChecked();

		await user.click( within( widthGroup ).getByRole( 'radio', { name: /Regular/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				layout: expect.objectContaining( { width: 'regular' } ),
			} )
		);
	} );

	it( 'seeds the width control from the stored layout width', async () => {
		const user = userEvent.setup();
		render( { space: { ...SPACE, layout: { ...SPACE.layout, width: 'regular' } } } );

		await user.click( screen.getByRole( 'tab', { name: 'Layout' } ) );

		const widthGroup = screen.getByRole( 'radiogroup', { name: 'Width' } );
		expect( within( widthGroup ).getByRole( 'radio', { name: /Regular/ } ) ).toBeChecked();
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
		render( {
			others: [
				{ id: '9', slug: 'reading', name: 'Reading', layout: { color: 'red', icon: 'box' } },
			],
		} );

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

		expect( page ).toHaveBeenCalledWith( '/reader' );
		const list = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( list ).toEqual( [] );
	} );
} );
