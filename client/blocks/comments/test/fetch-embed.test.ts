/**
 * @jest-environment jsdom
 */
import nock from 'nock';
import { fetchEmbed } from '../load-comment-editor';

const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const route = () =>
	nock( 'https://public-api.wordpress.com' ).get( '/wpcom/v2/read/embed' ).query( { url: URL } );

describe( 'fetchEmbed', () => {
	afterEach( () => nock.cleanAll() );

	it( 'answers the preview as a 200 for the editor to read', async () => {
		route().reply( 200, { html: '<iframe></iframe>' } );

		const response = await fetchEmbed( URL );

		expect( response.status ).toBe( 200 );
		expect( await response.json() ).toEqual( { html: '<iframe></iframe>' } );
	} );

	it( 'keeps the status of an error the route answered', async () => {
		route().reply( 404, { code: 'oembed_invalid_url', message: 'Not Found' } );

		expect( ( await fetchEmbed( URL ) ).status ).toBe( 404 );
	} );
} );
