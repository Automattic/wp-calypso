/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TagFeedPanel } from '../tag-feed-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const connection: AtmosphereConnection = {
	id: 42,
	did: 'did:plc:abc',
	handle: 'alice.bsky.social',
	display_name: 'Alice',
	avatar: null,
};

const BASE = 'https://public-api.wordpress.com';
const PATH = '/wpcom/v2/reader/atmosphere/connections/42/tag/rust/feed';

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'TagFeedPanel', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders the hashtag heading after the first page resolves', async () => {
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust' } } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
	} );

	it( 'renders the count line when count is set', async () => {
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust', count: 1234 } } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByText( /1,?234 posts/ ) ).toBeVisible() );
	} );

	it( 'omits the count line when count is undefined', async () => {
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust' } } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
		expect( screen.queryByText( /\d+ posts?/i ) ).not.toBeInTheDocument();
	} );

	// The backend emits `count: null` (not omitted) when the AppView's
	// `hitsTotal` is absent — guard the loose null/undefined check.
	it( 'omits the count line when count is null', async () => {
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust', count: null } } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
		expect( screen.queryByText( /\d+ posts?/i ) ).not.toBeInTheDocument();
	} );

	it( 'fires the tag_feed_viewed Tracks event when data resolves', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust' } } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( 'calypso_reader_atmosphere_tag_feed_viewed', {
				connection_id: 42,
				hashtag: 'rust',
			} )
		);
	} );

	it( 're-fires tag_feed_viewed when the hashtag changes within the same mount', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust' } } );
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/tag/go/feed' )
			.reply( 200, { items: [], cursor: null, tag: { name: 'go' } } );

		const { rerender } = renderWithProvider(
			<TagFeedPanel connection={ connection } hashtag="rust" />,
			{ queryClient: makeQueryClient() }
		);

		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( 'calypso_reader_atmosphere_tag_feed_viewed', {
				connection_id: 42,
				hashtag: 'rust',
			} )
		);

		rerender( <TagFeedPanel connection={ connection } hashtag="go" /> );

		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( 'calypso_reader_atmosphere_tag_feed_viewed', {
				connection_id: 42,
				hashtag: 'go',
			} )
		);
	} );

	it( 'fires tag_feed_error_shown when the query fails', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE ).get( PATH ).reply( 429, { error: 'atmosphere_rate_limited' } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_tag_feed_error_shown',
				expect.objectContaining( {
					connection_id: 42,
					hashtag: 'rust',
					error_kind: 'rate_limited',
				} )
			)
		);
	} );

	it( 'fires tag_feed_retry_clicked and refetches when the retry button is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const user = userEvent.setup();
		// rate_limited is a terminal error kind — the query factory does not
		// auto-retry, so a single fail-then-success pair is enough.
		nock( BASE ).get( PATH ).reply( 429, { error: 'atmosphere_rate_limited' } );
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust' } } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		const retry = await screen.findByRole( 'button', { name: /retry/i } );
		await user.click( retry );

		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_tag_feed_retry_clicked',
			expect.objectContaining( {
				connection_id: 42,
				hashtag: 'rust',
				error_kind: 'rate_limited',
			} )
		);
		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
	} );

	it( 'fires tag_feed_back_to_timeline_clicked when the back button is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const user = userEvent.setup();
		nock( BASE )
			.get( PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust' } } );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		const back = await screen.findByRole( 'button', { name: /back/i } );
		await user.click( back );

		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_tag_feed_back_to_timeline_clicked',
			{
				connection_id: 42,
				hashtag: 'rust',
			}
		);
		expect( page ).toHaveBeenCalledWith( '/reader/atmosphere/42/timeline' );
	} );
} );
