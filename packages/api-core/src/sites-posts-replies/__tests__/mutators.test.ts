import nock from 'nock';
import { createSitePostReply } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

describe( 'site post replies mutators', () => {
	afterEach( () => nock.cleanAll() );

	it( 'creates a root post reply', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/replies/new', { content: 'new comment' } )
			.reply( 200, { ID: 10, post: { ID: 456 }, content: 'new comment' } );

		const comment = await createSitePostReply( {
			siteId: 123,
			postId: 456,
			content: 'new comment',
		} );

		expect( scope.isDone() ).toBe( true );
		expect( comment.ID ).toBe( 10 );
	} );
} );
