import nock from 'nock';
import { fetchSiteComment } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'site comments fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches a single comment by id', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/789' )
			.query( { author_wpcom_data: 'true', force: 'wpcom' } )
			.reply( 200, { ID: 789, post: { ID: 456 }, content: 'specific' } );

		const comment = await fetchSiteComment( { siteId: 123, commentId: 789 } );

		expect( scope.isDone() ).toBe( true );
		expect( comment.ID ).toBe( 789 );
	} );
} );
