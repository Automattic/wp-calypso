import nock from 'nock';
import {
	adaptReadSiteRecommendationsResponse,
	dismissReadSiteRecommendation,
	fetchReadSiteRecommendations,
} from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchReadSiteRecommendations', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches /read/recommendations/sites on apiVersion 1.2 with legacy query params', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( {
				number: '4',
				offset: '8',
				seed: '42',
				posts_per_site: '0',
			} )
			.reply( 200, { algorithm: 'algo', sites: [], meta: { next_page: 'ignored' } } );

		await expect(
			fetchReadSiteRecommendations( { number: 4, offset: 8, seed: 42 } )
		).resolves.toEqual( { algorithm: 'algo', sites: [], meta: { next_page: 'ignored' } } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'uses default number, offset, and seed values when omitted', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( {
				number: '4',
				offset: '0',
				seed: '0',
				posts_per_site: '0',
			} )
			.reply( 200, { algorithm: 'algo', sites: [] } );

		await fetchReadSiteRecommendations();
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'maps API fields to ReadSiteRecommendation and decodes titles', () => {
		expect(
			adaptReadSiteRecommendationsResponse( {
				algorithm: 'chicken-recs/es1',
				sites: [
					{
						blog_id: 19096129,
						blog_title: 'Bente Haarstad Photography&amp;',
						blog_url: 'https://bentehaarstad.wordpress.com',
						description: 'Description 1',
						feed_id: 185124,
						feed_url: 'https://bentehaarstad.wordpress.com/feed/',
						icon: {
							ico: 'https://bentehaarstad.wordpress.com/favicon.ico',
							img: 'https://bentehaarstad.wordpress.com/favicon.ico',
							media_id: '12345',
						},
						ID: 12345,
						name: 'Fallback Name',
						railcar: { railcar: 'railcar-1', fetch_algo: 'algo', fetch_position: 0 },
						URL: 'https://fallback.example',
					},
					{
						blog_id: 38492359,
						description: 'Description 2',
						feed_id: 42081376,
						feed_url: 'https://chrisnicholaswrites.wordpress.com/feed/',
						ID: 12346,
						name: 'The Renegade Press&amp;',
						railcar: {},
						URL: 'https://chrisnicholaswrites.wordpress.com',
					},
				],
			} )
		).toEqual( [
			{
				algorithm: 'chicken-recs/es1',
				blogId: 19096129,
				description: 'Description 1',
				feedId: 185124,
				feedUrl: 'https://bentehaarstad.wordpress.com/feed/',
				icon: 'https://bentehaarstad.wordpress.com/favicon.ico',
				railcar: { railcar: 'railcar-1', fetch_algo: 'algo', fetch_position: 0 },
				title: 'Bente Haarstad Photography&',
				url: 'https://bentehaarstad.wordpress.com',
			},
			{
				algorithm: 'chicken-recs/es1',
				blogId: 38492359,
				description: 'Description 2',
				feedId: 42081376,
				feedUrl: 'https://chrisnicholaswrites.wordpress.com/feed/',
				icon: undefined,
				railcar: {},
				title: 'The Renegade Press&',
				url: 'https://chrisnicholaswrites.wordpress.com',
			},
		] );
	} );
} );

describe( 'dismissReadSiteRecommendation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'dismisses a site recommendation through the legacy endpoint', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/me/dismiss/sites/123/new' )
			.reply( 200, { success: true } );

		await expect( dismissReadSiteRecommendation( { siteId: 123 } ) ).resolves.toEqual( {
			success: true,
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'throws when the API reports an unsuccessful dismissal', async () => {
		nock( BASE ).post( '/rest/v1.1/me/dismiss/sites/123/new' ).reply( 200, {
			success: false,
		} );

		await expect( dismissReadSiteRecommendation( { siteId: 123 } ) ).rejects.toThrow(
			'Site dismiss was unsuccessful'
		);
	} );
} );
