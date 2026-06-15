/**
 * @jest-environment jsdom
 */

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import TopicGroupCard from '../topic-group-card';
import type { CuratedBlog } from '../../curated-blogs';

// Track every feed query the component actually fires so tests can assert
// the viewport-gated fetching behavior (no requests until cards enter the viewport).
// `mock`-prefixed name is required by babel-plugin-jest-hoist to be referenced
// inside the jest.mock factory below.
const mockFeedQueryCalls: number[] = [];

jest.mock( '@automattic/api-queries', () => {
	const actual = jest.requireActual( '@automattic/api-queries' );
	return {
		...actual,
		readFeedQuery: ( feedId: number ) => ( {
			...actual.readFeedQuery( feedId ),
			queryFn: async () => {
				mockFeedQueryCalls.push( feedId );
				return {
					image: `https://icons.example/${ feedId }.png`,
					subscribers_count: 1000 * feedId,
				};
			},
		} ),
	};
} );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	__esModule: true,
	SiteIcon: ( { alt }: { alt?: string } ) => <span data-testid="site-icon" aria-label={ alt } />,
} ) );

const blogs: CuratedBlog[] = [
	{
		feed_ID: 1,
		site_ID: 11,
		site_URL: 'https://a.example',
		site_name: 'A',
		feed_URL: 'https://a.example/feed',
		has_icon: true,
	},
	{
		feed_ID: 2,
		site_ID: 12,
		site_URL: 'https://b.example',
		site_name: 'B',
		feed_URL: 'https://b.example/feed',
		has_icon: true,
	},
	{
		feed_ID: 3,
		site_ID: 13,
		site_URL: 'https://c.example',
		site_name: 'C',
		feed_URL: 'https://c.example/feed',
		has_icon: true,
	},
	{
		feed_ID: 4,
		site_ID: 14,
		site_URL: 'https://d.example',
		site_name: 'D',
		feed_URL: 'https://d.example/feed',
		has_icon: true,
	},
	{
		feed_ID: 5,
		site_ID: 15,
		site_URL: 'https://e.example',
		site_name: 'E',
		feed_URL: 'https://e.example/feed',
		has_icon: true,
	},
];

const defaultProps = {
	title: 'Food & Drinks',
	imageUrl: 'https://images.example/food.jpg',
	description: 'Recipes, restaurants, and more.',
	tags: [ 'food', 'drinks' ],
	blogs,
	isSubscribed: false,
	onSubscribe: jest.fn(),
};

describe( 'TopicGroupCard', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockFeedQueryCalls.length = 0;
	} );

	it( 'renders the title, description, and image', () => {
		renderWithProvider( <TopicGroupCard { ...defaultProps } /> );

		expect( screen.getByRole( 'heading', { name: 'Food & Drinks' } ) ).toBeInTheDocument();
		expect( screen.getByText( 'Recipes, restaurants, and more.' ) ).toBeInTheDocument();
		const img = screen.getByRole( 'presentation', { hidden: true } ) as HTMLImageElement;
		expect( img ).toHaveAttribute( 'src', 'https://images.example/food.jpg' );
	} );

	it( 'renders avatars capped to 3 with a "+N" overflow indicator', () => {
		renderWithProvider( <TopicGroupCard { ...defaultProps } /> );

		// The mocked SiteIcon emits one node per blog avatar that we render.
		expect( screen.getAllByTestId( 'site-icon' ) ).toHaveLength( 3 );
		expect( screen.getByText( '+2' ) ).toBeInTheDocument();
	} );

	it( 'shows the first three pack blogs for avatars (pack order from getPackBlogs puts icons first)', () => {
		// Same ordering `getPackBlogs` applies after unbiased selection.
		const packOrdered: CuratedBlog[] = [
			{
				feed_ID: 2,
				site_ID: 12,
				site_URL: 'https://has-icon-a.example',
				site_name: 'HasIconA',
				feed_URL: 'https://has-icon-a.example/feed',
				has_icon: true,
			},
			{
				feed_ID: 4,
				site_ID: 14,
				site_URL: 'https://has-icon-b.example',
				site_name: 'HasIconB',
				feed_URL: 'https://has-icon-b.example/feed',
				has_icon: true,
			},
			{
				feed_ID: 1,
				site_ID: 11,
				site_URL: 'https://no-icon-first.example',
				site_name: 'NoIconFirst',
				feed_URL: 'https://no-icon-first.example/feed',
				has_icon: false,
			},
			{
				feed_ID: 3,
				site_ID: 13,
				site_URL: 'https://no-icon-second.example',
				site_name: 'NoIconSecond',
				feed_URL: 'https://no-icon-second.example/feed',
				has_icon: false,
			},
			{
				feed_ID: 5,
				site_ID: 15,
				site_URL: 'https://no-icon-third.example',
				site_name: 'NoIconThird',
				feed_URL: 'https://no-icon-third.example/feed',
				has_icon: false,
			},
		];

		renderWithProvider( <TopicGroupCard { ...defaultProps } blogs={ packOrdered } /> );

		const labels = screen
			.getAllByTestId( 'site-icon' )
			.map( ( el ) => el.getAttribute( 'aria-label' ) );
		expect( labels ).toEqual( [ 'HasIconA', 'HasIconB', 'NoIconFirst' ] );
		expect( screen.getByText( '+2' ) ).toBeInTheDocument();
	} );

	it( 'omits the overflow pill when blogs fit within the visible cap', () => {
		renderWithProvider( <TopicGroupCard { ...defaultProps } blogs={ blogs.slice( 0, 3 ) } /> );

		expect( screen.getAllByTestId( 'site-icon' ) ).toHaveLength( 3 );
		expect( screen.queryByText( /^\+\d/ ) ).not.toBeInTheDocument();
	} );

	it( 'calls onSubscribe when the Subscribe button is clicked', async () => {
		const onSubscribe = jest.fn();
		const user = userEvent.setup();
		renderWithProvider( <TopicGroupCard { ...defaultProps } onSubscribe={ onSubscribe } /> );

		await user.click( screen.getByRole( 'button', { name: /subscribe to food & drinks/i } ) );

		expect( onSubscribe ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders the "Subscribed" state with the button disabled and does not invoke onSubscribe on click', async () => {
		const onSubscribe = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<TopicGroupCard { ...defaultProps } isSubscribed onSubscribe={ onSubscribe } />
		);

		const button = screen.getByRole( 'button', { name: /subscribed to food & drinks/i } );
		// `accessibleWhenDisabled` keeps the button focusable and uses
		// aria-disabled rather than the native disabled attribute.
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( screen.getByText( 'Subscribed' ) ).toBeInTheDocument();

		await user.click( button );
		expect( onSubscribe ).not.toHaveBeenCalled();
	} );

	describe( 'subscriber count', () => {
		it( 'renders the formatted total subscriber count once feed data loads', async () => {
			// The mock returns subscribers_count: 1000 * feedId for each feed.
			// With blogs fixture (feed_ID 1–5): 1000+2000+3000+4000+5000 = 15000 → "15K readers".
			renderWithProvider( <TopicGroupCard { ...defaultProps } /> );
			// mockAllIsIntersecting must be called after render so the observed elements receive
			// the callback. This simulates the card entering the viewport.
			mockAllIsIntersecting( true );

			await waitFor( () => {
				expect( screen.getByText( /readers/i ) ).toBeVisible();
			} );

			// formatNumberCompact(15000) → "15K" in the default locale.
			expect( screen.getByText( /15[,.]?0?K?\s*readers/i ) ).toBeInTheDocument();
		} );

		it( 'renders no subscriber count when all feeds return 0 subscribers', async () => {
			// feed_ID: 0 → module-level mock returns subscribers_count: 1000 * 0 = 0.
			// Flush the async queryFn so allSettled flips to true, then assert absence.
			const zeroBlog = { ...blogs[ 0 ], feed_ID: 0 };
			renderWithProvider( <TopicGroupCard { ...defaultProps } blogs={ [ zeroBlog ] } /> );
			mockAllIsIntersecting( true );

			// Wait for the feed query to actually fire AND settle, so we know we're
			// asserting the post-load zero-count path rather than the still-loading state.
			await waitFor( () => {
				expect( mockFeedQueryCalls ).toContain( 0 );
			} );
			await act( async () => {} );

			expect( screen.queryByText( /readers/i ) ).not.toBeInTheDocument();
		} );

		it( 'renders no subscriber count while feeds are still loading', () => {
			// After render, queries are pending (async, not yet resolved). Simulate the card
			// entering the viewport to enable queries, then assert before they resolve.
			renderWithProvider( <TopicGroupCard { ...defaultProps } /> );
			mockAllIsIntersecting( true ); // enables queries but they haven't resolved yet

			// Synchronous check — the async queryFns haven't resolved yet.
			expect( screen.queryByText( /readers/i ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'in-view behavior', () => {
		it( 'does not fire any feed queries while the card is out of view', async () => {
			// Render the card, then explicitly report it (and all child avatar refs) as out of view.
			renderWithProvider( <TopicGroupCard { ...defaultProps } /> );
			mockAllIsIntersecting( false );

			// Flush async operations to give any (incorrectly enabled) queries a chance to run.
			await act( async () => {} );

			// The PR's key behavior: no network requests fire for out-of-view cards.
			expect( mockFeedQueryCalls ).toEqual( [] );
			expect( screen.queryByText( /readers/i ) ).not.toBeInTheDocument();
		} );

		it( 'fetches data for all pack blogs and shows the total when the card is in view', async () => {
			// Render, then simulate the card entering the viewport.
			renderWithProvider( <TopicGroupCard { ...defaultProps } /> );
			mockAllIsIntersecting( true );

			await waitFor( () => {
				expect( screen.getByText( /readers/i ) ).toBeVisible();
			} );

			// All 5 feeds are requested exactly once (not just the 3 shown as avatars).
			// BlogAvatar's per-avatar useQuery and the card-level useQueries share the
			// React Query cache, so each feedId's queryFn runs at most once. Asserting
			// both the sorted contents and the length catches missing requests, extra
			// requests, and duplicate requests (which would defeat the cache-sharing).
			expect( [ ...mockFeedQueryCalls ].sort() ).toEqual( [ 1, 2, 3, 4, 5 ] );
			expect( mockFeedQueryCalls ).toHaveLength( 5 );

			// 1000+2000+3000+4000+5000 = 15000 → "15K readers".
			expect( screen.getByText( /15[,.]?0?K?\s*readers/i ) ).toBeInTheDocument();
		} );
	} );
} );
