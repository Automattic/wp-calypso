/**
 * @vitest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { type Mock, vi } from 'vitest';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonTagFeedView } from '../tag-feed-view';
import type React from 'react';

vi.mock( 'calypso/reader/components/reader-main', () => ( {
	default: function ReaderMain( { children }: { children: React.ReactNode } ) {
		return <div>{ children }</div>;
	},
} ) );

vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );

vi.mock( '@automattic/calypso-router', () => {
	const replace = vi.fn();
	const fn = vi.fn() as Mock & { replace: Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

beforeAll( () => {
	global.IntersectionObserver = class IntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof global.IntersectionObserver;
} );

afterAll( () => {
	// @ts-expect-error -- cleaning up the stub
	delete global.IntersectionObserver;
} );

const BASE = 'https://public-api.wordpress.com';

afterEach( () => nock.cleanAll() );

describe( 'MastodonTagFeedView', () => {
	it( 'renders the panel once the connection resolves', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections' )
			.reply( 200, {
				connections: [
					{
						id: 7,
						handle: '@me@mastodon.social',
						instance: 'mastodon.social',
						display_name: 'Me',
						avatar: null,
					},
				],
			} );
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, { items: [], cursor: null } );

		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		renderWithProvider( <MastodonTagFeedView connectionId={ 7 } hashtag="rust" />, {
			queryClient,
		} );
		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
	} );
} );
