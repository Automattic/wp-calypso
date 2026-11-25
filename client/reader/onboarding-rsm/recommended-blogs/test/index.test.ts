import { getTopicGroups } from '../../interests-modal/topic-groups';
import { RECOMMENDED_BLOG_LIST_KEYS, getRecommendedBlogs } from '../index';

const additionalTopicKeys = [
	'books',
	'family',
	'writing',
	'politics',
	'blogging',
	'fashion',
	'health',
	'humor',
	'poetry',
	'love',
	'entertainment',
	'education',
	'inspiration',
	'relationships',
	'religion',
	'sports',
	'business',
	'creativity',
	'beauty',
	'work',
	'history',
	'reading',
	'social-media',
	'cooking',
	'internet',
	'lifestyle',
	'media',
	'fitness',
	'environment',
] as const;

describe( 'recommended blogs', () => {
	it( 'covers all 46 topic keys and the Most subscribed list in order', () => {
		expect( RECOMMENDED_BLOG_LIST_KEYS ).toEqual( [
			'most-subscribed',
			...getTopicGroups().flatMap( ( group ) => group.tags ),
			...additionalTopicKeys,
		] );
		expect( RECOMMENDED_BLOG_LIST_KEYS ).toHaveLength( 47 );
		expect( new Set( RECOMMENDED_BLOG_LIST_KEYS ).size ).toBe( 47 );
	} );

	it.each( RECOMMENDED_BLOG_LIST_KEYS )( '%s has exactly twelve valid recommendations', ( key ) => {
		const blogs = getRecommendedBlogs( key );

		expect( blogs ).toHaveLength( 12 );
		expect( new Set( blogs.map( ( blog ) => blog.feed_ID ) ).size ).toBe( blogs.length );

		for ( const blog of blogs ) {
			expect( Number.isInteger( blog.feed_ID ) ).toBe( true );
			expect( blog.feed_ID ).toBeGreaterThan( 0 );
			expect( Number.isInteger( blog.site_ID ) ).toBe( true );
			expect( blog.site_ID ).toBeGreaterThanOrEqual( 0 );
			expect( blog.name.trim() ).not.toBe( '' );
			expect( blog.description.trim() ).not.toBe( '' );
			for ( const url of [ blog.site_URL, blog.feed_URL ] ) {
				expect( [ 'http:', 'https:' ] ).toContain( new URL( url ).protocol );
			}
			expect( new URL( blog.icon_URL ).protocol ).toBe( 'https:' );
		}
	} );
} );
