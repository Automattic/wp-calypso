import nock from 'nock';
import { fetchReadFourForFourCandidates, fetchReadFourForFourStatus } from '../fetchers';
import { recordReadFourForFourProgress } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

describe( 'read four-for-four', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches candidates from the wpcom/v2 endpoint', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/read/four-for-four/candidates' )
			.reply( 200, { candidates: [ { blog_id: 2, feed_id: 20, name: 'Two' } ] } );

		const response = await fetchReadFourForFourCandidates();

		expect( scope.isDone() ).toBe( true );
		expect( response.candidates ).toHaveLength( 1 );
	} );

	it( 'fetches the status from the wpcom/v2 endpoint', async () => {
		nock( BASE )
			.get( '/wpcom/v2/read/four-for-four/status' )
			.reply( 200, { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 2 ] } );

		const response = await fetchReadFourForFourStatus();

		expect( response ).toEqual( { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 2 ] } );
	} );

	it( 'posts progress with the followed blog ids', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/read/four-for-four/progress', { blog_ids: [ 2, 3 ] } )
			.reply( 200, { status: 'opted_in', blog_id: 1, followed_blog_ids: [ 2, 3 ] } );

		const response = await recordReadFourForFourProgress( { blog_ids: [ 2, 3 ] } );

		expect( scope.isDone() ).toBe( true );
		expect( response.followed_blog_ids ).toEqual( [ 2, 3 ] );
	} );
} );
