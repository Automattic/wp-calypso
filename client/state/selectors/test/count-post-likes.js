import { countPostLikes } from 'calypso/state/posts/selectors/count-post-likes';

describe( 'countPostLikes()', () => {
	test( 'should return null if the site has never been fetched', () => {
		const count = countPostLikes(
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

		expect( count ).toBeNull();
	} );

	test( 'should return null if the post has never been fetched', () => {
		const count = countPostLikes(
			{
				posts: {
					likes: {
						items: {
							12345678: {
								10: { found: 42 },
							},
						},
					},
				},
			},
			12345678,
			50
		);

		expect( count ).toBeNull();
	} );

	test( 'should return the total of post likes', () => {
		const count = countPostLikes(
			{
				posts: {
					likes: {
						items: {
							12345678: {
								50: { found: 42 },
							},
						},
					},
				},
			},
			12345678,
			50
		);

		expect( count ).toEqual( 42 );
	} );
} );
