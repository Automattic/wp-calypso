import nock from 'nock';
import { likeSiteComment, unlikeSiteComment } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

describe( 'site comment like mutators', () => {
	afterEach( () => nock.cleanAll() );

	it( 'likes a comment and normalizes the returned count', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/sites/123/comments/789/likes/new', {} )
			.reply( 200, { success: true, like_count: '4' } );

		const response = await likeSiteComment( { siteId: 123, commentId: 789 } );

		expect( scope.isDone() ).toBe( true );
		expect( response.likeCount ).toBe( 4 );
	} );

	it( 'unlikes a comment and normalizes the returned count', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/sites/123/comments/789/likes/mine/delete', {} )
			.reply( 200, { success: true, like_count: '3' } );

		const response = await unlikeSiteComment( { siteId: 123, commentId: 789 } );

		expect( scope.isDone() ).toBe( true );
		expect( response.likeCount ).toBe( 3 );
	} );
} );
