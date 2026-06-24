import nock from 'nock';
import { createSiteCommentReply } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

describe( 'site comment replies mutators', () => {
	afterEach( () => nock.cleanAll() );

	it( 'creates a reply to an existing comment', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/sites/123/comments/789/replies/new', { content: 'reply' } )
			.reply( 200, { ID: 11, parent: { ID: 789 }, post: { ID: 456 }, content: 'reply' } );

		const comment = await createSiteCommentReply( {
			siteId: 123,
			parentCommentId: 789,
			content: 'reply',
		} );

		expect( scope.isDone() ).toBe( true );
		expect( comment.parent?.ID ).toBe( 789 );
	} );
} );
