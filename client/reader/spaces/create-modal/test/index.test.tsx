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
	slug: 'work',
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
				slug: String( name ).toLowerCase().replace( /\s+/g, '-' ),
				title: name,
				follows: [],
				tags: body.tags ?? [],
				languages: body.languages ?? [],
				layout: body.layout ?? { color: 'blue', icon: 'inbox' },
			};
		} );
}

function setup( {
	existing = [] as ReadSpace[],
	onCreated = jest.fn(),
	localeSlug,
}: { existing?: ReadSpace[]; onCreated?: jest.Mock; localeSlug?: string } = {} ) {
	const queryClient = new QueryClient();
	queryClient.setQueryData( readSpacesQuery().queryKey, existing );
	const onClose = jest.fn();
	const user = userEvent.setup();
	renderWithProvider( <CreateSpaceModal isOpen onClose={ onClose } onCreated={ onCreated } />, {
		queryClient,
		initialState: localeSlug ? { currentUser: { user: { localeSlug } } } : undefined,
	} );
	return { queryClient, onClose, onCreated, user };
}

type User = ReturnType< typeof userEvent.setup >;

// Walk from the opening Identity step to the Feeds step. The name is required to
// leave the first step, so it is entered here.
async function reachFeedsStep( user: User, name = 'Reading' ) {
	await user.type( screen.getByLabelText( 'Name' ), name );
	await user.click( screen.getByRole( 'button', { name: 'Next' } ) ); // Identity → Layout
	await user.click( screen.getByRole( 'button', { name: 'Next' } ) ); // Layout → Feeds
}

// Walk all the way to the final Topics step, where Create lives.
async function reachTopicsStep( user: User, name = 'Reading' ) {
	await reachFeedsStep( user, name );
	await user.click( screen.getByRole( 'button', { name: 'Next' } ) ); // Feeds → Topics
	await screen.findByRole( 'button', { name: 'Create' } );
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

	it( 'keeps Next disabled until a valid name is entered', async () => {
		const { user } = setup();

		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeDisabled();

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );

		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeEnabled();
	} );

	it( 'steps through the identity, layout, feeds and topics sections', async () => {
		mockSubscriptions = [ mockSubscription ];
		const { user } = setup();

		const dialog = screen.getByRole( 'dialog', { name: 'Create a new space' } );

		// The wizard replaces the tab strip with one step at a time.
		expect( within( dialog ).queryByRole( 'tab' ) ).not.toBeInTheDocument();
		expect( within( dialog ).getByLabelText( 'Name' ) ).toBeVisible();
		expect( within( dialog ).getByLabelText( 'Step 1 of 4' ) ).toBeInTheDocument();

		await user.type( within( dialog ).getByLabelText( 'Name' ), 'Reading' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Next' } ) );

		// Layout step.
		expect( within( dialog ).getByRole( 'radio', { name: /Classic/ } ) ).toBeChecked();
		await user.click( within( dialog ).getByRole( 'button', { name: 'Next' } ) );

		// Feeds step: only the subscription picker.
		expect(
			within( dialog ).getByText(
				'Pick the subscriptions whose posts make up this space’s main feed.'
			)
		).toBeVisible();
		expect( within( dialog ).getByRole( 'button', { name: 'All subscriptions' } ) ).toBeVisible();
		expect( within( dialog ).getByRole( 'listitem', { name: 'Example Blog' } ) ).toBeVisible();
		expect( within( dialog ).queryByRole( 'combobox', { name: 'Tags' } ) ).not.toBeInTheDocument();
		await user.click( within( dialog ).getByRole( 'button', { name: 'Next' } ) );

		// Topics step is last, so it carries the Create button.
		expect( within( dialog ).getByRole( 'combobox', { name: 'Tags' } ) ).toBeVisible();
		expect( within( dialog ).getByRole( 'combobox', { name: 'Languages' } ) ).toBeVisible();
		expect( await within( dialog ).findByRole( 'button', { name: 'Create' } ) ).toBeVisible();

		// Back returns to the previous step.
		await user.click( within( dialog ).getByRole( 'button', { name: 'Back' } ) );
		expect( within( dialog ).getByRole( 'button', { name: 'All subscriptions' } ) ).toBeVisible();
	} );

	it( 'cannot advance past the identity step without a name', async () => {
		const { user } = setup();

		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeDisabled();

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.clear( screen.getByLabelText( 'Name' ) );

		expect( await screen.findByText( 'Name is required' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeDisabled();
	} );

	it( 'rejects a name longer than the maximum length', async () => {
		const { user } = setup();

		await user.type( screen.getByLabelText( 'Name' ), 'a'.repeat( 51 ) );

		expect( await screen.findByText( /50 characters or fewer/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeDisabled();
	} );

	it( 'rejects a duplicate name regardless of case', async () => {
		const { user } = setup( { existing: [ WORK ] } );

		await user.type( screen.getByLabelText( 'Name' ), 'work' );

		expect( await screen.findByText( 'A space with this name already exists' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeDisabled();
	} );

	it( 'creates a space with identity and layout settings, updates the caches, and closes', async () => {
		mockSubscriptions = [ mockSubscription ];
		const { user, onClose, queryClient } = setup();
		const onBody = jest.fn();
		mockCreateEndpoint( 'Reading', onBody );

		// Identity step.
		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.click(
			within( screen.getByRole( 'radiogroup', { name: 'Accent color' } ) ).getByRole( 'radio', {
				name: 'Green',
			} )
		);
		await user.click( screen.getByRole( 'radio', { name: 'Star' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );

		// Layout step.
		await user.click( screen.getByRole( 'radio', { name: /Classic/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );

		// Feeds step.
		await user.click( screen.getByRole( 'button', { name: 'Add Example Blog' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );

		// Topics step (last) carries the Create button.
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				title: 'Reading',
				feeds: [ 456 ],
				tags: [],
				layout: { color: 'green', iconColor: 'blue', icon: 'star', view: 'legacy', width: 'wide' },
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
				language_count: 0,
				source_count: 1,
				layout: 'legacy',
				icon: 'star',
				color: 'green',
				icon_color: 'blue',
			}
		);
	} );

	it( 'pre-fills the account language as a base code and sends it on create', async () => {
		// pt-br is a regional locale; the field should pre-fill the base "Português".
		const { user, onClose } = setup( { localeSlug: 'pt-br' } );
		const onBody = jest.fn();
		mockCreateEndpoint( 'Leitura', onBody );

		// The languages field lives on the final Topics step.
		await reachTopicsStep( user, 'Leitura' );
		const dialog = screen.getByRole( 'dialog', { name: 'Create a new space' } );
		expect( within( dialog ).getByText( 'Português' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( { title: 'Leitura', languages: [ 'pt' ] } )
		);
	} );

	it( 'sends topics entered in the wizard when creating', async () => {
		const { user, onClose } = setup();
		const onBody = jest.fn();
		mockCreateEndpoint( 'Reading', onBody );

		await reachTopicsStep( user );
		await user.type( screen.getByRole( 'combobox', { name: 'Tags' } ), 'design[Enter]' );
		await user.type( screen.getByRole( 'combobox', { name: 'Languages' } ), 'English[Enter]' );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( onBody ).toHaveBeenCalledWith(
			expect.objectContaining( {
				tags: [ 'design' ],
				languages: [ 'en' ],
			} )
		);
	} );

	it( 'sends no languages when the account has no locale', async () => {
		const { user, onClose } = setup();
		const onBody = jest.fn();
		mockCreateEndpoint( 'Reading', onBody );

		await reachTopicsStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( onBody ).toHaveBeenCalledWith( expect.objectContaining( { languages: [] } ) );
	} );

	it( 'notifies the parent with the created space', async () => {
		const { user, onCreated } = setup();
		mockCreateEndpoint( 'Reading' );

		await reachTopicsStep( user );
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
