/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { canCurrentUserEditPost } from '../';

describe( 'canCurrentUserEditPost()', () => {
	const fakeGlobalId = 'abcdef1234';
	const fakeUserId = 1;
	const fakeOtherUserId = 2;
	const fakeSiteId = 3;
	const fakePostId = 4;

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

		expect( canEdit ).to.be.null;
	} );

	test( "should allow based on 'edit_posts' for unrecognized post type (author)", () => {
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
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							edit_posts: true,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.true;
	} );

	test( "should deny based on 'edit_posts' for unrecognized post type (author)", () => {
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
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							edit_posts: false,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.false;
	} );

	test( "should allow based on 'edit_others_posts' for unrecognized post type (not author)", () => {
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
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeOtherUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							edit_others_posts: true,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.true;
	} );

	test( "should deny based on 'edit_others_posts' for unrecognized post type (not author)", () => {
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
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeOtherUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							edit_others_posts: false,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.false;
	} );

	test( 'should allow based on post type capability (author)', () => {
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
										type: 'some_cpt',
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {
						[ fakeSiteId ]: {
							some_cpt: {
								capabilities: {
									edit_posts: 'cpt_edit_posts',
								},
							},
						},
					},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							cpt_edit_posts: true,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.true;
	} );

	test( 'should deny based on post type capability (author)', () => {
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
										type: 'some_cpt',
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {
						[ fakeSiteId ]: {
							some_cpt: {
								capabilities: {
									edit_posts: 'cpt_edit_posts',
								},
							},
						},
					},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							cpt_edit_posts: false,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.false;
	} );

	test( 'should allow based on post type capability (not author)', () => {
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
										type: 'some_cpt',
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeOtherUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {
						[ fakeSiteId ]: {
							some_cpt: {
								capabilities: {
									edit_others_posts: 'cpt_edit_others_posts',
								},
							},
						},
					},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							cpt_edit_others_posts: true,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.true;
	} );

	test( 'should deny based on post type capability (not author)', () => {
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
										type: 'some_cpt',
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeOtherUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {
						[ fakeSiteId ]: {
							some_cpt: {
								capabilities: {
									edit_others_posts: 'cpt_edit_others_posts',
								},
							},
						},
					},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {
						[ fakeSiteId ]: {
							cpt_edit_others_posts: false,
						},
					},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.false;
	} );

	test( 'should return null for unknown post type and unknown capability', () => {
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
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.null;
	} );

	test( 'should return null for known post type and unknown capability', () => {
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
										type: 'some_cpt',
										global_ID: fakeGlobalId,
										site_ID: fakeSiteId,
										ID: fakePostId,
										author: {
											ID: fakeUserId,
										},
									};
								}

								return null;
							},
						},
					},
				},
				postTypes: {
					items: {
						[ fakeSiteId ]: {
							some_cpt: {
								capabilities: {
									edit_posts: 'cpt_edit_posts',
								},
							},
						},
					},
				},
				currentUser: {
					id: fakeUserId,
					capabilities: {},
				},
			},
			fakeGlobalId
		);

		expect( canEdit ).to.be.null;
	} );
} );
