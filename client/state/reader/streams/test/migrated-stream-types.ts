/**
 * @jest-environment node
 */
import { isMigratedStream } from '../migrated-stream-types';

describe( 'isMigratedStream', () => {
	it.each( [
		'following',
		'discover',
		'recent',
		'search',
		'feed',
		'site',
		'notifications',
		'featured',
		'p2',
		'a8c',
		'tag',
		'tag_popular',
		'list',
		'on_this_day',
		'user',
	] )( 'returns true for `%s`', ( streamType ) => {
		expect( isMigratedStream( streamType ) ).toBe( true );
	} );

	it.each( [
		'conversations',
		'conversations-a8c',
		'likes',
		'recommendations_posts',
		'custom_recs_posts_with_images',
		'custom_recs_sites_with_images',
	] )( 'returns false for unmigrated `%s`', ( streamType ) => {
		expect( isMigratedStream( streamType ) ).toBe( false );
	} );
} );
