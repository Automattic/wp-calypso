import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';

describe( 'getPostLikes()', () => {
	test( 'should return null if the site has never been fetched', () => {
		const postLikes = getPostLikes(
			{
				posts: {
					likes: {
						items: {},
					},
				},
			},
			12345678,
			50
		);

		expect( postLikes ).toBeNull();
	} );

	test( 'should return null if the post has never been fetched', () => {
		const likes = [ { ID: 1, login: 'chicken' } ];
		const postLikes = getPostLikes(
			{
				posts: {
					likes: {
						items: {
							12345678: {
								10: { likes },
							},
						},
					},
				},
			},
			12345678,
			50
		);

		expect( postLikes ).toBeNull();
	} );

	test( 'should return the post likes', () => {
		const likes = [ { ID: 1, login: 'chicken' } ];
		const postLikes = getPostLikes(
			{
				posts: {
					likes: {
						items: {
							12345678: {
								50: { likes },
							},
						},
					},
				},
			},
			12345678,
			50
		);

		expect( postLikes ).toEqual( likes );
	} );
} );
