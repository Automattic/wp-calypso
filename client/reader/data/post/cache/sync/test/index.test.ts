/*
 * @jest-environment jsdom
 */
import { readerPostQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import waitForImagesToLoad from 'calypso/lib/post-normalizer/rule-wait-for-images-to-load';
import { getCachedPost, syncPostCache } from 'calypso/reader/data/post/cache';
import readerContentWidth from 'calypso/reader/lib/content-width';

jest.mock( 'calypso/lib/post-normalizer/rule-wait-for-images-to-load', () => ( {
	__esModule: true,
	default: jest.fn( ( post: Record< string, unknown > ) =>
		Promise.resolve( { ...post, slow_cache_test_marker: true } )
	),
} ) );

const makeQueryClient = () => new QueryClient();
const mockWaitForImagesToLoad = waitForImagesToLoad as jest.Mock;

describe( 'syncPostCache', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
		mockWaitForImagesToLoad.mockClear();
	} );

	it( 'normalizes posts before writing them into the canonical post cache', () => {
		const queryClient = makeQueryClient();

		syncPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				content: '<p>Hello <strong>Reader</strong></p>',
			},
		] );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
			content_no_html: 'Hello Reader',
			better_excerpt_no_html: 'Hello Reader',
			minutes_to_read: 0,
		} );
	} );

	it( 'applies slow normalization results after the fast cache write', async () => {
		const queryClient = makeQueryClient();

		syncPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				content: '<p>Hello slow normalization</p>',
			},
		] );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			content_no_html: 'Hello slow normalization',
		} );
		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).not.toMatchObject( {
			slow_cache_test_marker: true,
		} );

		await waitFor( () => {
			expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
				slow_cache_test_marker: true,
			} );
		} );
	} );

	it( 'coalesces duplicate slow normalization work in the same tick', async () => {
		const queryClient = makeQueryClient();
		const post = {
			ID: 1,
			site_ID: 100,
			global_ID: 'global-1',
			content: '<p>Hello duplicate slow normalization</p>',
		};

		syncPostCache( queryClient, [ post ] );
		syncPostCache( queryClient, [ post ] );

		await waitFor( () => {
			expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
				slow_cache_test_marker: true,
			} );
		} );
		expect( mockWaitForImagesToLoad ).toHaveBeenCalledTimes( 1 );
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

		syncPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				_should_reload: true,
				content: '<p>Stale post</p>',
			},
		] );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toBeNull();

		await waitFor( () => {
			expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
				content_no_html: 'Reloaded post',
				better_excerpt_no_html: 'Reloaded post',
			} );
		} );
		expect(
			queryClient.getQueryData(
				readerPostQuery( { blogId: 100, postId: 1 }, readerContentWidth() ).queryKey
			)
		).toMatchObject( {
			ID: 1,
			site_ID: 100,
			content: '<p>Reloaded post</p>',
		} );
	} );
} );
