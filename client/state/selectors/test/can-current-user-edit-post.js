import { canCurrentUserEditPost } from 'calypso/state/posts/selectors/can-current-user-edit-post';

describe( 'canCurrentUserEditPost()', () => {
	const fakeGlobalId = 'abcdef1234';
	const fakeSiteId = 1;
	const fakePostId = 2;

	test( 'should return null if the post is not known', () => {
		const canEdit = canCurrentUserEditPost(
			{
				posts: {
					items: {},
					queries: {},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).toBeNull();
	} );

	test( 'should return null if the post capabilities are not known', () => {
		const canEdit = canCurrentUserEditPost(
			{
				posts: {
					items: {
						[ fakeGlobalId ]: [ fakeSiteId, fakePostId ],
					},
					queries: {
						[ fakeSiteId ]: {
							getItem( postId ) {
								if ( postId === fakePostId ) {
									return {
										type: 'post',
									};
								}

								return null;
							},
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).toBeNull();
	} );

	test( 'should allow based on the post capabilities', () => {
		const canEdit = canCurrentUserEditPost(
			{
				posts: {
					items: {
						[ fakeGlobalId ]: [ fakeSiteId, fakePostId ],
					},
					queries: {
						[ fakeSiteId ]: {
							getItem( postId ) {
								if ( postId === fakePostId ) {
									return {
										type: 'post',
										capabilities: {
											edit_post: true,
										},
									};
								}

								return null;
							},
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).toBe( true );
	} );

	test( 'should deny based on the post capabilities', () => {
		const canEdit = canCurrentUserEditPost(
			{
				posts: {
					items: {
						[ fakeGlobalId ]: [ fakeSiteId, fakePostId ],
					},
					queries: {
						[ fakeSiteId ]: {
							getItem( postId ) {
								if ( postId === fakePostId ) {
									return {
										type: 'post',
										capabilities: {
											edit_post: false,
										},
									};
								}

								return null;
							},
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).toBe( false );
	} );
} );
