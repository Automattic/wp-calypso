/*
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { getCachedReaderPost } from 'calypso/reader/data/reader-post-cache';
import { syncReaderPostCache } from 'calypso/reader/data/reader-post-cache-sync';

jest.mock( 'calypso/lib/post-normalizer/rule-wait-for-images-to-load', () => ( {
	__esModule: true,
	default: ( post: Record< string, unknown > ) =>
		Promise.resolve( { ...post, slow_cache_test_marker: true } ),
} ) );

const makeQueryClient = () => new QueryClient();

describe( 'syncReaderPostCache', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

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

	it( 'applies slow normalization results after the fast cache write', async () => {
		const queryClient = makeQueryClient();

		syncReaderPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				content: '<p>Hello slow normalization</p>',
			},
		] );

		expect( getCachedReaderPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			content_no_html: 'Hello slow normalization',
		} );
		expect( getCachedReaderPost( queryClient, { blogId: 100, postId: 1 } ) ).not.toMatchObject( {
			slow_cache_test_marker: true,
		} );

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
				slow_cache_test_marker: true,
			} );
		} );
	} );

	it( 'reloads posts marked as stale before writing them into the canonical post cache', async () => {
		const queryClient = makeQueryClient();

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/100/posts/1' )
			.query( true )
			.reply( 200, {
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				content: '<p>Reloaded post</p>',
			} );

		syncReaderPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				_should_reload: true,
				content: '<p>Stale post</p>',
			},
		] );

		expect( getCachedReaderPost( queryClient, { blogId: 100, postId: 1 } ) ).toBeNull();

		await waitFor( () => {
			expect( getCachedReaderPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
				content_no_html: 'Reloaded post',
				better_excerpt_no_html: 'Reloaded post',
			} );
		} );
	} );
} );
