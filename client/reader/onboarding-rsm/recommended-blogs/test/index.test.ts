import { getTopicGroups } from '../../interests-modal/topic-groups';
import { RECOMMENDED_BLOG_LIST_KEYS, getRecommendedBlogs, recommendedBlogGetters } from '../index';

describe( 'recommended blogs', () => {
	it( 'covers the onboarding tags in order and the Most subscribed list', () => {
		expect( RECOMMENDED_BLOG_LIST_KEYS ).toEqual( [
			'most-subscribed',
			...getTopicGroups().flatMap( ( group ) => group.tags ),
		] );
		expect( Object.keys( recommendedBlogGetters ) ).toEqual( RECOMMENDED_BLOG_LIST_KEYS );
	} );

	it.each( RECOMMENDED_BLOG_LIST_KEYS )(
		'%s has a complete, valid list or an empty scaffold',
		( key ) => {
			const blogs = getRecommendedBlogs( key );

			expect( [ 0, 12 ] ).toContain( blogs.length );
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
		}
	);
} );
