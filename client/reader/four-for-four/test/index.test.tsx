/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
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
} );
