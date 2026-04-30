/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TagFeedPanel } from '../tag-feed-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

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

	it( 'renders the View on Bluesky link only for https URLs', async () => {
		nock( BASE )
			.get( PATH )
			.reply( 200, {
				items: [],
				cursor: null,
				tag: { name: 'rust', url: 'https://bsky.app/hashtag/rust' },
			} );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () =>
			expect( screen.getByRole( 'link', { name: /View on Bluesky/i } ) ).toHaveAttribute(
				'href',
				'https://bsky.app/hashtag/rust'
			)
		);
	} );

	it( 'omits the View on Bluesky link when the URL is non-https', async () => {
		nock( BASE )
			.get( PATH )
			.reply( 200, {
				items: [],
				cursor: null,
				tag: { name: 'rust', url: 'javascript:alert(1)' },
			} );

		renderWithProvider( <TagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
		expect( screen.queryByRole( 'link', { name: /View on Bluesky/i } ) ).not.toBeInTheDocument();
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
} );
