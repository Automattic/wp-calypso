/**
 * @jest-environment jsdom
 */
import {
	getSiteSubscriptionsQueryKey,
	readSpaceQuery,
	readSpacesQuery,
	siteSubscriptionsQuery,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { successNotice } from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SourcesModal } from '../index';
import type { ReadSpaceDetails, SiteSubscriptionItem } from '@automattic/api-core';

jest.mock( 'calypso/state/notices/actions', () => ( {
	successNotice: jest.fn( ( text, options ) => ( {
		type: 'MOCK_SUCCESS_NOTICE',
		notice: { text, options },
	} ) ),
} ) );

jest.mock( '@automattic/react-virtualized', () => ( {
	AutoSizer: ( {
		children,
	}: {
		children: ( size: { width: number; height: number } ) => React.ReactNode;
	} ) => children( { width: 480, height: 360 } ),
	List: ( {
		rowCount,
		rowRenderer,
	}: {
		rowCount: number;
		rowRenderer: ( props: {
			index: number;
			key: string;
			style: React.CSSProperties;
		} ) => React.ReactNode;
	} ) => (
		<div>
			{ Array.from( { length: Math.min( rowCount, 5 ) }, ( _value, index ) =>
				rowRenderer( { index, key: `row-${ index }`, style: {} } )
			) }
		</div>
	),
} ) );

const WORK: ReadSpaceDetails = {
	id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
	name: 'Work',
	tags: [],
	layout: { color: 'blue', icon: 'inbox' },
	sources: [],
};

const STRATECHERY: SiteSubscriptionItem = {
	ID: 1,
	URL: 'https://stratechery.com',
	feed_URL: 'https://stratechery.com/feed',
	blog_ID: 123,
	feed_ID: 456,
	name: 'Stratechery',
	site_icon: 'https://stratechery.com/icon.png',
	is_following: true,
};

const VERGE: SiteSubscriptionItem = {
	ID: 2,
	URL: 'https://theverge.com',
	feed_URL: 'https://theverge.com/rss/index.xml',
	blog_ID: 124,
	feed_ID: 457,
	name: 'The Verge',
	site_icon: null,
	is_following: true,
};

function makeSubscription( index: number ): SiteSubscriptionItem {
	return {
		ID: index,
		URL: `https://example-${ index }.com`,
		feed_URL: `https://example-${ index }.com/feed`,
		blog_ID: 1000 + index,
		feed_ID: 2000 + index,
		name: `Example ${ index }`,
		site_icon: null,
		is_following: true,
	};
}

function makeSiteSubscriptionsData(
	subscriptions: SiteSubscriptionItem[]
): SiteSubscriptionsInfiniteData {
	return {
		pages: [ { subscriptions, totalCount: subscriptions.length, page: 1, number: 100 } ],
		pageParams: [ 1 ],
	};
}

function setup( {
	space = WORK,
	subscriptions = [ STRATECHERY, VERGE ],
}: {
	space?: ReadSpaceDetails;
	subscriptions?: SiteSubscriptionItem[];
} = {} ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( readSpacesQuery().queryKey, [ space ] );
	queryClient.setQueryData( readSpaceQuery( space.id ).queryKey, space );
	queryClient.setQueryData(
		getSiteSubscriptionsQueryKey(),
		makeSiteSubscriptionsData( subscriptions )
	);
	const onClose = jest.fn();
	const user = userEvent.setup();

	const renderResult = renderWithProvider(
		<SourcesModal isOpen spaceId={ space.id } onClose={ onClose } />,
		{
			queryClient,
			initialState: { currentUser: { id: 1 } },
		}
	);

	return { queryClient, onClose, user, ...renderResult };
}

describe( 'SourcesModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'does not fetch subscriptions or space details while closed', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		renderWithProvider(
			<SourcesModal isOpen={ false } spaceId={ WORK.id } onClose={ jest.fn() } />,
			{
				queryClient,
				initialState: { currentUser: { id: 1 } },
			}
		);

		// Disabled queries stay idle (no background pagination / fetch) when the
		// modal is closed.
		expect(
			queryClient.getQueryState( getSiteSubscriptionsQueryKey() )?.fetchStatus ?? 'idle'
		).toBe( 'idle' );
		expect(
			queryClient.getQueryState( readSpaceQuery( WORK.id ).queryKey )?.fetchStatus ?? 'idle'
		).toBe( 'idle' );
	} );

	it( 'renders a skeleton while subscriptions are loading', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( readSpacesQuery().queryKey, [ WORK ] );
		queryClient.setQueryData( readSpaceQuery( WORK.id ).queryKey, WORK );

		renderWithProvider( <SourcesModal isOpen spaceId={ WORK.id } onClose={ jest.fn() } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByRole( 'status', { name: 'Loading subscriptions' } ) ).toBeVisible();
	} );

	it( 'renders a skeleton while the space details are loading', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		// Subscriptions are ready, but the space detail query is held pending with
		// a never-resolving fetch (not awaited) so the modal stays in loading.
		queryClient.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeSiteSubscriptionsData( [ STRATECHERY ] )
		);
		queryClient.prefetchQuery( {
			...readSpaceQuery( WORK.id ),
			queryFn: () => new Promise< never >( () => undefined ),
		} );

		renderWithProvider( <SourcesModal isOpen spaceId={ WORK.id } onClose={ jest.fn() } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByRole( 'status', { name: 'Loading subscriptions' } ) ).toBeVisible();
		// Title falls back to the generic label while the space name is unknown.
		expect( screen.getByRole( 'heading', { name: 'Sources' } ) ).toBeVisible();
	} );

	it( 'shows an error message when subscriptions fail to load', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false, retryOnMount: false } },
		} );
		queryClient.setQueryData( readSpacesQuery().queryKey, [ WORK ] );
		queryClient.setQueryData( readSpaceQuery( WORK.id ).queryKey, WORK );
		await queryClient.prefetchInfiniteQuery( {
			...siteSubscriptionsQuery(),
			queryFn: () => Promise.reject( new Error( 'Failed to load subscriptions' ) ),
		} );

		renderWithProvider( <SourcesModal isOpen spaceId={ WORK.id } onClose={ jest.fn() } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
			'We couldn’t load your subscriptions. Please try again.'
		);
		expect( screen.queryByText( 'No subscriptions found.' ) ).not.toBeInTheDocument();
	} );

	it( 'adds and removes a subscription in the space cache immediately', async () => {
		const { queryClient, user } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Add Stratechery' } ) );

		await waitFor( () =>
			expect(
				queryClient.getQueryData< ReadSpaceDetails >( readSpaceQuery( WORK.id ).queryKey )?.sources
			).toEqual( [
				expect.objectContaining( {
					feedId: 456,
					blogId: 123,
					feedUrl: 'https://stratechery.com/feed',
					siteUrl: 'https://stratechery.com',
					name: 'Stratechery',
					siteIcon: 'https://stratechery.com/icon.png',
				} ),
			] )
		);

		await user.click( screen.getByRole( 'button', { name: 'Remove Stratechery' } ) );

		await waitFor( () =>
			expect(
				queryClient.getQueryData< ReadSpaceDetails >( readSpaceQuery( WORK.id ).queryKey )?.sources
			).toEqual( [] )
		);
	} );

	it( 'filters to subscriptions already in this space', async () => {
		const { user } = setup( {
			space: {
				...WORK,
				sources: [
					{
						feedId: 456,
						blogId: 123,
						feedUrl: 'https://stratechery.com/feed',
						siteUrl: 'https://stratechery.com',
						name: 'Stratechery',
						siteIcon: 'https://stratechery.com/icon.png',
					},
				],
			},
		} );

		await user.click( screen.getByRole( 'button', { name: 'In this space · 1' } ) );

		expect( screen.getByText( 'Stratechery' ) ).toBeVisible();
		expect( screen.queryByText( 'The Verge' ) ).not.toBeInTheDocument();
	} );

	it( 'filters subscriptions by search text', async () => {
		const { user } = setup();

		await user.type(
			screen.getByRole( 'searchbox', { name: 'Search your subscriptions' } ),
			'verge'
		);

		expect( screen.queryByText( 'Stratechery' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'The Verge' ) ).toBeVisible();
	} );

	it( 'closes when Done is clicked', async () => {
		const { user, onClose } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Done' } ) );

		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'shows a success notice when a source is added', async () => {
		const { user } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Add Stratechery' } ) );

		expect( successNotice ).toHaveBeenCalledWith( 'Source added to this space.', {
			duration: 5000,
		} );
	} );

	it( 'shows a success notice when a source is removed', async () => {
		const { user } = setup( {
			space: {
				...WORK,
				sources: [
					{
						feedId: 456,
						blogId: 123,
						feedUrl: 'https://stratechery.com/feed',
						siteUrl: 'https://stratechery.com',
						name: 'Stratechery',
						siteIcon: 'https://stratechery.com/icon.png',
					},
				],
			},
		} );

		await user.click( screen.getByRole( 'button', { name: 'Remove Stratechery' } ) );

		expect( successNotice ).toHaveBeenCalledWith( 'Source removed from this space.', {
			duration: 5000,
		} );
	} );

	it( 'uses SiteIcon for each subscription row', () => {
		setup();
		const row = screen.getByRole( 'listitem', { name: /Stratechery/ } );

		expect( within( row ).getByText( 'Stratechery' ) ).toBeVisible();
		expect( within( row ).getByRole( 'img', { name: 'Stratechery' } ) ).toBeVisible();
	} );

	it( 'virtualizes long subscription lists', () => {
		setup( {
			subscriptions: Array.from( { length: 30 }, ( _value, index ) =>
				makeSubscription( index + 1 )
			),
		} );

		expect( screen.getByRole( 'listitem', { name: 'Example 1' } ) ).toBeVisible();
		expect( screen.queryByRole( 'listitem', { name: 'Example 20' } ) ).not.toBeInTheDocument();
		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 5 );
	} );
} );
