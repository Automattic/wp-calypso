/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useFollowSite } from 'calypso/reader/data/site-subscriptions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FourForFour } from '../index';

const mockRecordReaderTracksEvent = jest.fn();

jest.mock( '@automattic/calypso-router', () => jest.fn() );

jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

jest.mock( 'calypso/reader/stream/typed', () => ( {
	TypedStream: ( { streamKey }: { streamKey: string } ) => (
		<div data-testid="preview-stream">{ streamKey }</div>
	),
} ) );

jest.mock( 'calypso/blocks/reader-subscription-list-item/connected', () => ( {
	__esModule: true,
	default: ( {
		siteId,
		site,
		onItemClick,
	}: {
		siteId: number;
		site: { title: string };
		onItemClick: () => void;
	} ) => (
		<button type="button" data-testid={ `list-item-${ siteId }` } onClick={ onItemClick }>
			{ site.title }
		</button>
	),
} ) );

// A follow button that runs the real follow mutation, so the page's
// "report progress once the follow succeeds" path is exercised end to end.
function MockFollowButton( {
	siteUrl,
	followApiSource,
}: {
	siteUrl: string;
	followApiSource: string;
} ) {
	const { mutate } = useFollowSite();
	return (
		<button type="button" onClick={ () => mutate( { feedUrl: siteUrl, source: followApiSource } ) }>
			Subscribe
		</button>
	);
}

jest.mock( 'calypso/reader/follow-button', () => ( {
	__esModule: true,
	default: ( props: { siteUrl: string; followApiSource: string } ) => (
		<MockFollowButton { ...props } />
	),
} ) );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: () => null,
} ) );

jest.mock( 'calypso/reader/controller-helper', () => ( {
	trackScrollPage: jest.fn(),
} ) );

const API = 'https://public-api.wordpress.com';

const candidate = ( blogId: number, name: string, isParticipant = false ) => ( {
	blog_id: blogId,
	feed_id: blogId * 10,
	name,
	url: `https://site${ blogId }.wordpress.com`,
	feed_url: `https://site${ blogId }.wordpress.com/feed/`,
	description: '',
	icon: null,
	is_participant: isParticipant,
} );

function mockCandidates( candidates: ReturnType< typeof candidate >[] ) {
	nock( API ).get( '/wpcom/v2/read/four-for-four/candidates' ).reply( 200, { candidates } );
}

function mockStatus( status: string | null, followedBlogIds: number[] = [] ) {
	nock( API )
		.get( '/wpcom/v2/read/four-for-four/status' )
		.reply( 200, { status, blog_id: 1, followed_blog_ids: followedBlogIds } );
}

function mockFollow( blogId: number, delayMs = 0 ) {
	return nock( API )
		.post( '/rest/v1.1/read/following/mine/new' )
		.delay( delayMs )
		.reply( 200, {
			subscribed: true,
			subscription: {
				ID: 500 + blogId,
				blog_ID: blogId,
				feed_ID: blogId * 10,
				URL: `https://site${ blogId }.wordpress.com/feed/`,
			},
		} );
}

const initialState = {
	currentUser: { id: 1, user: { ID: 1, email_verified: true } },
};

// No backoff between the progress mutation's own retries, and no
// retries for queries, so failure paths resolve quickly.
const createQueryClient = () =>
	new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retryDelay: 0 } },
	} );

describe( 'FourForFour', () => {
	beforeEach( () => {
		nock.cleanAll();
		nock( API ).persist().get( '/rest/v1.2/read/following/mine' ).query( true ).reply( 200, {
			number: 0,
			page: 1,
			total_subscriptions: 0,
			subscriptions: [],
		} );
		mockRecordReaderTracksEvent.mockClear();
		jest.mocked( page ).mockClear();
	} );

	it( 'lists candidates and previews the first one', async () => {
		mockStatus( 'opted_in' );
		mockCandidates( [ candidate( 2, 'Second Site', true ), candidate( 3, 'Third Site' ) ] );

		renderWithProvider( <FourForFour />, { initialState } );

		expect( await screen.findByTestId( 'list-item-2' ) ).toHaveTextContent( 'Second Site' );
		expect( screen.getByTestId( 'list-item-3' ) ).toHaveTextContent( 'Third Site' );
		expect( screen.getByTestId( 'preview-stream' ) ).toHaveTextContent( 'feed:20' );
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '0' );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_four_for_four_site_previewed',
			{ blog_id: 2, is_participant: 1 }
		);
	} );

	it( 'previews the clicked site and records the preview event', async () => {
		const user = userEvent.setup();
		mockStatus( 'opted_in' );
		mockCandidates( [ candidate( 2, 'Second Site' ), candidate( 3, 'Third Site' ) ] );

		renderWithProvider( <FourForFour />, { initialState } );

		await user.click( await screen.findByTestId( 'list-item-3' ) );

		expect( screen.getByTestId( 'preview-stream' ) ).toHaveTextContent( 'feed:30' );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_four_for_four_site_previewed',
			{ blog_id: 3, is_participant: 0 }
		);
	} );

	it( 'shows server-recorded progress', async () => {
		mockStatus( 'opted_in', [ 4, 5, 6 ] );
		mockCandidates( [ candidate( 2, 'Second Site' ) ] );

		renderWithProvider( <FourForFour />, { initialState } );

		await waitFor( () =>
			expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '3' )
		);
		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );

	it( 'reports a follow only after it succeeds, then shows completion from the server', async () => {
		const user = userEvent.setup();
		mockStatus( 'opted_in', [ 3, 4, 5 ] );
		mockCandidates( [ candidate( 2, 'Second Site' ) ] );
		const follow = mockFollow( 2, 300 );
		const progress = nock( API )
			.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
			.reply( 200, { status: 'completed', blog_id: 1, followed_blog_ids: [ 3, 4, 5, 2 ] } );

		renderWithProvider( <FourForFour />, { initialState } );

		await user.click( await screen.findByRole( 'button', { name: 'Subscribe' } ) );

		// The meter moves on the click, before the follow request has returned.
		await waitFor( () =>
			expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '4' )
		);
		expect( progress.isDone() ).toBe( false );

		await waitFor( () => expect( follow.isDone() ).toBe( true ) );
		await waitFor( () => expect( progress.isDone() ).toBe( true ) );
		expect( await screen.findByRole( 'status' ) ).toHaveTextContent( "You're in!" );
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '4' );
		expect( screen.getByRole( 'button', { name: 'Back to Reader' } ) ).toBeVisible();
	} );

	it( 'shows completion for a user who arrives already complete', async () => {
		mockStatus( 'completed', [ 2, 3, 4, 5 ] );
		mockCandidates( [] );

		renderWithProvider( <FourForFour />, { initialState } );

		expect( await screen.findByRole( 'status' ) ).toHaveTextContent( "You're in!" );
	} );

	it( 'shows a retryable empty state when the pool is empty', async () => {
		const user = userEvent.setup();
		mockStatus( 'opted_in' );
		mockCandidates( [] );
		const refetch = nock( API )
			.get( '/wpcom/v2/read/four-for-four/candidates' )
			.reply( 200, { candidates: [ candidate( 2, 'Second Site' ) ] } );

		renderWithProvider( <FourForFour />, { initialState } );

		expect( await screen.findByText( 'No new writers to show right now.' ) ).toBeVisible();
		await user.click( screen.getByRole( 'button', { name: 'Check again' } ) );

		expect( await screen.findByTestId( 'list-item-2' ) ).toHaveTextContent( 'Second Site' );
		expect( refetch.isDone() ).toBe( true );
	} );

	it( 'returns to the Reader when closed', async () => {
		const user = userEvent.setup();
		mockStatus( 'opted_in' );
		mockCandidates( [ candidate( 2, 'Second Site' ) ] );

		renderWithProvider( <FourForFour />, { initialState } );

		await user.click( await screen.findByRole( 'button', { name: 'Do this later' } ) );

		expect( page ).toHaveBeenCalledWith( '/reader' );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_four_for_four_closed',
			{ followed_count: 0, is_complete: 0 }
		);
	} );

	describe( 'saving progress', () => {
		it( 'shows an error when a save fails and saves again on retry', async () => {
			const user = userEvent.setup();
			mockStatus( 'opted_in', [ 3, 4, 5 ] );
			mockCandidates( [ candidate( 2, 'Second Site' ) ] );
			mockFollow( 2 );
			const failures = nock( API )
				.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
				.times( 3 )
				.reply( 500, { code: 'error' } );

			renderWithProvider( <FourForFour />, { initialState, queryClient: createQueryClient() } );

			await user.click( await screen.findByRole( 'button', { name: 'Subscribe' } ) );

			expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
				"We couldn't save your progress."
			);
			expect( failures.isDone() ).toBe( true );
			expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();

			const retry = nock( API )
				.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
				.reply( 200, { status: 'completed', blog_id: 1, followed_blog_ids: [ 3, 4, 5, 2 ] } );

			await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

			expect( await screen.findByRole( 'status' ) ).toHaveTextContent( "You're in!" );
			expect( retry.isDone() ).toBe( true );
			expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		} );

		it( 'shows an error when the status fails to load and reloads it on retry', async () => {
			const user = userEvent.setup();
			nock( API ).get( '/wpcom/v2/read/four-for-four/status' ).reply( 500, { code: 'error' } );
			mockCandidates( [ candidate( 2, 'Second Site' ) ] );

			renderWithProvider( <FourForFour />, { initialState, queryClient: createQueryClient() } );

			expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
				"We couldn't save your progress."
			);

			mockStatus( 'opted_in', [ 3, 4 ] );
			await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

			await waitFor( () =>
				expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '2' )
			);
			expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		} );

		it( 'sends one save at a time, carrying follows that finished meanwhile', async () => {
			const user = userEvent.setup();
			mockStatus( 'opted_in' );
			mockCandidates( [ candidate( 2, 'Second Site' ), candidate( 3, 'Third Site' ) ] );
			mockFollow( 2 );
			mockFollow( 3 );
			const first = nock( API )
				.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
				.delay( 300 )
				.reply( 200, { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 2 ] } );
			const second = nock( API )
				.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 3 ] } )
				.reply( 200, { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 2, 3 ] } );

			renderWithProvider( <FourForFour />, { initialState, queryClient: createQueryClient() } );

			await user.click( await screen.findByRole( 'button', { name: 'Subscribe' } ) );
			await user.click( screen.getByTestId( 'list-item-3' ) );
			await user.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

			// The second save waits for the first to finish.
			expect( second.isDone() ).toBe( false );
			await waitFor( () => expect( first.isDone() ).toBe( true ) );
			await waitFor( () => expect( second.isDone() ).toBe( true ) );
			expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '2' );
		} );
	} );

	describe( 'follows the server does not keep', () => {
		it( 'sends the follow again when the server does not count it', async () => {
			const user = userEvent.setup();
			mockStatus( 'opted_in', [ 3, 4, 5 ] );
			mockCandidates( [ candidate( 2, 'Second Site' ) ] );
			mockFollow( 2 );
			// The subscription has not propagated yet, so the server keeps none of it.
			const rejected = nock( API )
				.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
				.reply( 200, { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 3, 4, 5 ] } );
			const accepted = nock( API )
				.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
				.reply( 200, { status: 'completed', blog_id: 1, followed_blog_ids: [ 3, 4, 5, 2 ] } );

			renderWithProvider( <FourForFour />, { initialState, queryClient: createQueryClient() } );

			await user.click( await screen.findByRole( 'button', { name: 'Subscribe' } ) );

			await waitFor( () => expect( rejected.isDone() ).toBe( true ) );
			await waitFor( () => expect( accepted.isDone() ).toBe( true ) );
			expect( await screen.findByRole( 'status' ) ).toHaveTextContent( "You're in!" );
		} );

		it( 'gives up after three rejections and records the dropped follow', async () => {
			const user = userEvent.setup();
			mockStatus( 'opted_in', [ 3, 4, 5 ] );
			mockCandidates( [ candidate( 2, 'Second Site' ) ] );
			mockFollow( 2 );
			// A fourth request would have no mock and would fail the test.
			const rejections = nock( API )
				.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
				.times( 3 )
				.reply( 200, { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 3, 4, 5 ] } );

			renderWithProvider( <FourForFour />, { initialState, queryClient: createQueryClient() } );

			await user.click( await screen.findByRole( 'button', { name: 'Subscribe' } ) );

			// Long enough to cover both retry waits.
			await waitFor( () => expect( rejections.isDone() ).toBe( true ), { timeout: 4000 } );
			await waitFor( () =>
				expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
					'calypso_reader_four_for_four_progress_dropped',
					{ blog_id: 2, attempts: 3 }
				)
			);
			expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'candidate instrumentation', () => {
		it( 'records how many sites the writer was offered', async () => {
			mockStatus( 'opted_in' );
			mockCandidates( [ candidate( 2, 'Second Site', true ), candidate( 3, 'Third Site' ) ] );

			renderWithProvider( <FourForFour />, { initialState } );

			await screen.findByTestId( 'list-item-2' );
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_four_for_four_candidates_shown',
				{ count: 2, participant_count: 1 }
			);
		} );

		it( 'records an empty pool as a count of zero', async () => {
			mockStatus( 'opted_in' );
			mockCandidates( [] );

			renderWithProvider( <FourForFour />, { initialState } );

			expect( await screen.findByText( 'No new writers to show right now.' ) ).toBeVisible();
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_four_for_four_candidates_shown',
				{ count: 0, participant_count: 0 }
			);
		} );

		it( 'records a failure to load the pool', async () => {
			mockStatus( 'opted_in' );
			nock( API ).get( '/wpcom/v2/read/four-for-four/candidates' ).reply( 500, { code: 'error' } );

			renderWithProvider( <FourForFour />, { initialState, queryClient: createQueryClient() } );

			expect( await screen.findByText( "We couldn't load sites right now." ) ).toBeVisible();
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_four_for_four_candidates_error'
			);
		} );
	} );
} );
