import nock from 'nock';
// Importing `jest-fetch-mock` adds a jest-friendly `fetch` polyfill to the global scope.
import 'jest-fetch-mock';
import { fetchReaderThumbnail } from '../fetchers';

describe( 'fetchReaderThumbnail', () => {
	afterEach( () => nock.cleanAll() );

	it( 'returns a YouTube thumbnail synchronously without a network call', async () => {
		const url = await fetchReaderThumbnail( { service: 'youtube', id: 'UoOCrbV3ZQ' } );
		expect( url ).toBe( 'https://img.youtube.com/vi/UoOCrbV3ZQ/mqdefault.jpg' );
	} );

	describe( 'videopress', () => {
		it( 'returns the poster URL on a successful response', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/videos/ABCDabcd/poster' )
				.reply( 200, {
					poster: 'https://videos.files.wordpress.com/ABCDabcd/filename.original.jpg',
				} );

			const url = await fetchReaderThumbnail( { service: 'videopress', id: 'ABCDabcd' } );
			expect( url ).toBe( 'https://videos.files.wordpress.com/ABCDabcd/filename.original.jpg' );
		} );

		it( 'returns null on a failed response', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/videos/FOO0barr/poster' )
				.reply( 500, {} );

			const url = await fetchReaderThumbnail( { service: 'videopress', id: 'FOO0barr' } );
			expect( url ).toBeNull();
		} );
	} );

	describe( 'vimeo', () => {
		it( 'returns the large thumbnail on a successful response', async () => {
			nock( 'https://vimeo.com' )
				.get( '/api/v2/video/6999927.json' )
				.reply( 200, [ { thumbnail_large: 'https://i.vimeocdn.com/video/459553940_640.webp' } ] );

			const url = await fetchReaderThumbnail( { service: 'vimeo', id: '6999927' } );
			expect( url ).toBe( 'https://i.vimeocdn.com/video/459553940_640.webp' );
		} );

		it( 'returns null on a failed response', async () => {
			nock( 'https://vimeo.com' ).get( '/api/v2/video/6999928.json' ).reply( 500, {} );

			const url = await fetchReaderThumbnail( { service: 'vimeo', id: '6999928' } );
			expect( url ).toBeNull();
		} );
	} );

	describe( 'pocketcasts', () => {
		it( 'appends width and height query args from the response', async () => {
			nock( 'https://pca.st' )
				.get( '/oembed.json' )
				.query( { url: 'https://pca.st/abc123' } )
				.reply( 200, {
					thumbnail_url: 'https://example.com/podcast.jpg',
					thumbnail_width: 300,
					thumbnail_height: 100,
				} );

			const url = await fetchReaderThumbnail( { service: 'pocketcasts', id: 'abc123' } );
			expect( url ).toBe( 'https://example.com/podcast.jpg?w=300&h=100' );
		} );

		it( 'falls back to default width and height', async () => {
			nock( 'https://pca.st' )
				.get( '/oembed.json' )
				.query( { url: 'https://pca.st/xyz' } )
				.reply( 200, { thumbnail_url: 'https://example.com/podcast.jpg' } );

			const url = await fetchReaderThumbnail( { service: 'pocketcasts', id: 'xyz' } );
			expect( url ).toBe( 'https://example.com/podcast.jpg?w=220&h=80' );
		} );

		it( 'returns null when no thumbnail_url is provided', async () => {
			nock( 'https://pca.st' )
				.get( '/oembed.json' )
				.query( { url: 'https://pca.st/missing' } )
				.reply( 200, {} );

			const url = await fetchReaderThumbnail( { service: 'pocketcasts', id: 'missing' } );
			expect( url ).toBeNull();
		} );

		it( 'returns null on a failed response', async () => {
			nock( 'https://pca.st' )
				.get( '/oembed.json' )
				.query( { url: 'https://pca.st/boom' } )
				.reply( 500, {} );

			const url = await fetchReaderThumbnail( { service: 'pocketcasts', id: 'boom' } );
			expect( url ).toBeNull();
		} );
	} );
} );
