/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { type Mock, vi } from 'vitest';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TagFeedView } from '../tag-feed-view';
import type React from 'react';

vi.mock( 'calypso/reader/components/reader-main', () => ( {
	default: function ReaderMain( { children }: { children: React.ReactNode } ) {
		return <div>{ children }</div>;
	},
} ) );

vi.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );

vi.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: vi.fn() },
} ) );

const BASE = 'https://public-api.wordpress.com';
const CONNECTIONS_PATH = '/wpcom/v2/reader/atmosphere/connections';
const FEED_PATH = '/wpcom/v2/reader/atmosphere/connections/42/tag/rust/feed';

afterEach( () => {
	nock.cleanAll();
	vi.restoreAllMocks();
	( page.replace as Mock ).mockClear();
} );

describe( 'TagFeedView', () => {
	it( 'shows a loading status while connections are pending', async () => {
		nock( BASE ).get( CONNECTIONS_PATH ).delay( 100 ).reply( 200, { connections: [] } );

		renderWithProvider( <TagFeedView connectionId={ 42 } hashtag="rust" /> );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( /loading/i );
		expect( page.replace ).not.toHaveBeenCalled();
		// Wait for the delayed response so it can't outlive the test.
		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere' ) );
	} );

	it( 'redirects to /reader/atmosphere when the connection is missing', async () => {
		nock( BASE ).get( CONNECTIONS_PATH ).reply( 200, { connections: [] } );

		renderWithProvider( <TagFeedView connectionId={ 42 } hashtag="rust" /> );

		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere' ) );
	} );

	it( 'shows the connection-error UI when the connections query fails', async () => {
		// auth_required is a terminal error kind — the connections query won't
		// auto-retry, so a single 401 is enough to surface the error UI.
		nock( BASE ).get( CONNECTIONS_PATH ).reply( 401, { error: 'atmosphere_auth_required' } );

		renderWithProvider( <TagFeedView connectionId={ 42 } hashtag="rust" /> );

		await waitFor( () =>
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent( /couldn't load/i )
		);
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'renders the TagFeedPanel when the connection resolves', async () => {
		nock( BASE )
			.get( CONNECTIONS_PATH )
			.reply( 200, {
				connections: [
					{
						id: 42,
						did: 'did:plc:viewer',
						handle: 'viewer.bsky.social',
						display_name: 'Viewer',
						avatar: null,
					},
				],
			} );
		nock( BASE )
			.get( FEED_PATH )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust' } } );

		renderWithProvider( <TagFeedView connectionId={ 42 } hashtag="rust" /> );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
		expect( page.replace ).not.toHaveBeenCalled();
	} );
} );
