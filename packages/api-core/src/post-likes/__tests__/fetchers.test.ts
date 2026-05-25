import nock from 'nock';
import { fetchPostLikes, likePost, unlikePost } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'post likes fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetchPostLikes normalizes the legacy likes response', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/likes' )
			.reply( 200, {
				found: '72',
				i_like: true,
				likes: [ { ID: 1, login: 'alice' } ],
			} );

		await expect( fetchPostLikes( 123, 456 ) ).resolves.toEqual( {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );
	} );

	it( 'likePost posts source and normalizes the mutation response', async () => {
		nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/new', {} )
			.query( { source: 'reader' } )
			.reply( 200, {
				success: true,
				like_count: '73',
				liker: { ID: 1, login: 'alice' },
			} );

		await expect( likePost( { siteId: 123, postId: 456, source: 'reader' } ) ).resolves.toEqual( {
			likeCount: 73,
			liker: { ID: 1, login: 'alice' },
		} );
	} );

	it( 'unlikePost normalizes the mutation response', async () => {
		nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/mine/delete', {} )
			.reply( 200, {
				success: true,
				like_count: '71',
				liker: { ID: 1, login: 'alice' },
			} );

		await expect( unlikePost( { siteId: 123, postId: 456 } ) ).resolves.toEqual( {
			likeCount: 71,
			liker: { ID: 1, login: 'alice' },
		} );
	} );
} );
