/*
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { getCachedReaderPost } from 'calypso/reader/data/reader-post-cache';
import { syncReaderPostCache } from 'calypso/reader/data/reader-post-cache-sync';

const makeQueryClient = () => new QueryClient();

describe( 'syncReaderPostCache', () => {
	it( 'normalizes posts before writing them into the canonical post cache', () => {
		const queryClient = makeQueryClient();

		syncReaderPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				content: '<p>Hello <strong>Reader</strong></p>',
			},
		] );

		expect( getCachedReaderPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
			content_no_html: 'Hello Reader',
			better_excerpt_no_html: 'Hello Reader',
			minutes_to_read: 0,
		} );
	} );
} );
