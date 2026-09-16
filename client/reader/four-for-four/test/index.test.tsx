/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FourForFour } from '../index';

const mockRecordReaderTracksEvent = jest.fn();

jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

jest.mock( 'calypso/reader/stream', () => ( {
	__esModule: true,
	default: ( { streamKey }: { streamKey: string } ) => (
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

jest.mock( 'calypso/reader/follow-button', () => ( {
	__esModule: true,
	default: () => <button type="button">Subscribe</button>,
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
	subscribers_count: 1,
	program_follows_count: isParticipant ? 4 : 0,
	is_participant: isParticipant,
} );

function mockFollowing( blogIds: number[] ) {
	nock( API )
		.persist()
		.get( '/rest/v1.2/read/following/mine' )
		.query( true )
		.reply( 200, {
			number: blogIds.length,
			page: 1,
			total_subscriptions: blogIds.length,
			subscriptions: blogIds.map( ( blogId ) => ( {
				ID: blogId,
				blog_ID: blogId,
				feed_ID: blogId * 10,
				URL: `https://site${ blogId }.wordpress.com`,
				is_following: true,
			} ) ),
		} );
}

function mockCandidates( candidates: ReturnType< typeof candidate >[] ) {
	nock( API ).get( '/wpcom/v2/read/four-for-four/candidates' ).reply( 200, { candidates } );
}

function mockStatus( status: string | null, followedBlogIds: number[] = [] ) {
	nock( API )
		.get( '/wpcom/v2/read/four-for-four/status' )
		.reply( 200, { status, blog_id: 1, followed_blog_ids: followedBlogIds } );
}

const initialState = {
	currentUser: { id: 1, user: { ID: 1, email_verified: true } },
};

describe( 'FourForFour', () => {
	beforeEach( () => {
		nock.cleanAll();
		mockRecordReaderTracksEvent.mockClear();
	} );

	it( 'lists candidates and previews the first one', async () => {
		mockFollowing( [] );
		mockStatus( 'opted_in' );
		mockCandidates( [ candidate( 2, 'Second Site', true ), candidate( 3, 'Third Site' ) ] );

		renderWithProvider( <FourForFour />, { initialState } );

		expect( await screen.findByTestId( 'list-item-2' ) ).toHaveTextContent( 'Second Site' );
		expect( screen.getByTestId( 'list-item-3' ) ).toHaveTextContent( 'Third Site' );
		expect( screen.getByTestId( 'preview-stream' ) ).toHaveTextContent( 'feed:20' );
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '0' );
	} );

	it( 'previews the clicked site and records the preview event', async () => {
		const user = userEvent.setup();
		mockFollowing( [] );
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

	it( 'counts followed candidates as progress and records them', async () => {
		mockFollowing( [ 2, 3 ] );
		mockStatus( 'opted_in', [ 4 ] );
		mockCandidates( [ candidate( 2, 'Second Site' ), candidate( 3, 'Third Site' ) ] );
		const progress = nock( API )
			.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2, 3 ] } )
			.reply( 200, { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 4, 2, 3 ] } );

		renderWithProvider( <FourForFour />, { initialState } );

		await waitFor( () => expect( progress.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '3' )
		);
		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the completed state and fires the completion event once', async () => {
		mockFollowing( [ 2 ] );
		mockStatus( 'opted_in', [ 3, 4, 5 ] );
		mockCandidates( [ candidate( 2, 'Second Site' ) ] );
		nock( API )
			.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2 ] } )
			.reply( 200, { status: 'completed', blog_id: 1, followed_blog_ids: [ 3, 4, 5, 2 ] } );

		renderWithProvider( <FourForFour />, { initialState } );

		expect( await screen.findByRole( 'status' ) ).toHaveTextContent( "You're in!" );
		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_four_for_four_completed'
			)
		);
		expect(
			mockRecordReaderTracksEvent.mock.calls.filter(
				( [ name ] ) => name === 'calypso_reader_four_for_four_completed'
			)
		).toHaveLength( 1 );
	} );

	it( 'does not fire the completion event for a user who arrives already complete', async () => {
		mockFollowing( [] );
		mockStatus( 'completed', [ 2, 3, 4, 5 ] );
		mockCandidates( [] );

		renderWithProvider( <FourForFour />, { initialState } );

		expect( await screen.findByRole( 'status' ) ).toHaveTextContent( "You're in!" );
		expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_reader_four_for_four_completed'
		);
	} );

	it( 'shows the empty state when there are no candidates', async () => {
		mockFollowing( [] );
		mockStatus( 'opted_in' );
		mockCandidates( [] );

		renderWithProvider( <FourForFour />, { initialState } );

		expect(
			await screen.findByText( 'No new writers to show right now. Check back tomorrow.' )
		).toBeVisible();
	} );
} );
