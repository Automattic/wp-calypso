import { getRecommendedBlogGroups } from '../groups';
import { getRecommendedBlogListTitle, RECOMMENDED_BLOG_LIST_KEYS } from '../index';
import type { RecommendedBlog, RecommendedBlogListKey } from '../index';

const mockLists: Partial< Record< RecommendedBlogListKey, RecommendedBlog[] > > = {};

jest.mock( '../index', () => ( {
	...jest.requireActual( '../index' ),
	getRecommendedBlogs: ( key: RecommendedBlogListKey ) => mockLists[ key ] ?? [],
} ) );

const blog = ( feedId: number ): RecommendedBlog => ( {
	feed_ID: feedId,
	site_ID: 0,
	name: `Blog ${ feedId }`,
	site_URL: `https://blog-${ feedId }.example`,
	feed_URL: `https://blog-${ feedId }.example/feed`,
	icon_URL: `https://blog-${ feedId }.example/icon.png`,
	description: `About blog ${ feedId }`,
} );

describe( 'getRecommendedBlogGroups', () => {
	beforeEach( () => {
		for ( const key of Object.keys( mockLists ) ) {
			delete mockLists[ key as RecommendedBlogListKey ];
		}
	} );

	it( 'returns a group for each followed tag with a list, in onboarding order', () => {
		mockLists.food = [ blog( 1 ) ];
		mockLists.music = [ blog( 2 ) ];
		mockLists[ 'most-subscribed' ] = [ blog( 3 ) ];

		const groups = getRecommendedBlogGroups( [ 'music', 'food' ] );

		expect( groups.map( ( group ) => group.key ) ).toEqual( [ 'food', 'music' ] );
		expect( groups[ 0 ] ).toEqual( { key: 'food', title: 'Food', blogs: [ blog( 1 ) ] } );
	} );

	it( 'skips followed tags whose list is empty or not recommended', () => {
		mockLists.food = [ blog( 1 ) ];

		const groups = getRecommendedBlogGroups( [ 'food', 'music', 'knitting' ] );

		expect( groups.map( ( group ) => group.key ) ).toEqual( [ 'food' ] );
	} );

	it( 'includes the API topic slugs alongside the original onboarding tags', () => {
		mockLists.food = [ blog( 1 ) ];
		mockLists.books = [ blog( 2 ) ];
		mockLists[ 'social-media' ] = [ blog( 3 ) ];

		const groups = getRecommendedBlogGroups( [ 'social-media', 'books', 'food' ] );

		expect( groups.map( ( group ) => [ group.key, group.title ] ) ).toEqual( [
			[ 'food', 'Food' ],
			[ 'books', 'Books' ],
			[ 'social-media', 'Social media' ],
		] );
		expect( groups.map( ( group ) => group.blogs ) ).toEqual( [
			[ blog( 1 ) ],
			[ blog( 2 ) ],
			[ blog( 3 ) ],
		] );
	} );

	it( 'falls back to Most subscribed when no followed tag has a list', () => {
		mockLists[ 'most-subscribed' ] = [ blog( 3 ) ];

		expect( getRecommendedBlogGroups( [ 'knitting', 'music' ] ) ).toEqual( [
			{ key: 'most-subscribed', title: 'Most subscribed', blogs: [ blog( 3 ) ] },
		] );
		expect( getRecommendedBlogGroups( [] ) ).toEqual( [
			{ key: 'most-subscribed', title: 'Most subscribed', blogs: [ blog( 3 ) ] },
		] );
	} );

	it( 'does not show Most subscribed as its own interest', () => {
		mockLists[ 'most-subscribed' ] = [ blog( 3 ) ];
		mockLists.food = [ blog( 1 ) ];

		const groups = getRecommendedBlogGroups( [ 'most-subscribed', 'food' ] );

		expect( groups.map( ( group ) => group.key ) ).toEqual( [ 'food' ] );
	} );

	it( 'returns no groups when no list applies', () => {
		expect( getRecommendedBlogGroups( [ 'food' ] ) ).toEqual( [] );
	} );
} );

describe( 'getRecommendedBlogListTitle', () => {
	it( 'has a sentence-case title for every list', () => {
		for ( const key of RECOMMENDED_BLOG_LIST_KEYS ) {
			const title = getRecommendedBlogListTitle( key );
			expect( title ).toBeTruthy();
			expect( title.slice( 1 ) ).toBe( key === 'diy' ? 'IY' : title.slice( 1 ).toLowerCase() );
		}
	} );
} );
