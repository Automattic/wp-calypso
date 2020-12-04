/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	editedPostHasContent,
	isEmptyContent,
} from 'calypso/state/posts/selectors/edited-post-has-content';
import PostQueryManager from 'calypso/lib/query-manager/post';

describe( 'editedPostHasContent()', () => {
	test( 'should return false if there are no edits and no post', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {},
					edits: {},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.false;
	} );

	test( 'should return false if there are no edits and post has empty content', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'post',
								},
							},
						} ),
					},
					edits: {},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.false;
	} );

	test( 'should return true if there are no edits and the post has a title', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'post',
									title: 'chiken',
								},
							},
						} ),
					},
					edits: {},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.true;
	} );

	test( 'should return true if there are no edits and the post has content', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'post',
									content: 'ribs',
								},
							},
						} ),
					},
					edits: {},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.true;
	} );

	test( 'should return true if there are no edits and the post has an excerpt', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'post',
									excerpt: 'chicken ribs',
								},
							},
						} ),
					},
					edits: {},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.true;
	} );

	test( 'should return false if there are empty edits that overrides the post attributes', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'post',
									title: 'chicken',
									content: 'ribs',
									excerpt: 'chicken ribs',
								},
							},
						} ),
					},
					edits: {
						2916284: {
							841: [
								{
									title: '',
									content: '',
									excerpt: '',
								},
							],
						},
					},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.false;
	} );

	test( 'should return true if there are title edits', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {},
					edits: {
						2916284: {
							841: [ { title: 'chicken' } ],
						},
					},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.true;
	} );

	test( 'should return true if there are content edits', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {},
					edits: {
						2916284: {
							841: [ { content: 'ribs' } ],
						},
					},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.true;
	} );

	test( 'should return true if there are excerpt edits', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {},
					edits: {
						2916284: {
							841: [ { excerpt: 'chicken ribs' } ],
						},
					},
				},
				editor: {
					rawContent: {},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.true;
	} );

	test( 'should return true if there is empty content and non-empty raw content', () => {
		const hasContent = editedPostHasContent(
			{
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'post',
									content: '',
								},
							},
						} ),
					},
					edits: {},
				},
				editor: {
					rawContent: {
						initial: '',
						current: 'ribs',
					},
				},
			},
			2916284,
			841
		);

		expect( hasContent ).to.be.true;
	} );
} );

describe( 'isEmptyContent()', () => {
	test( 'should return true for empty strings', () => {
		const content = '';

		expect( isEmptyContent( content ) ).to.eql( true );
	} );

	test( 'should return true for empty paragraphs', () => {
		const content = '<p></p>';

		expect( isEmptyContent( content ) ).to.eql( true );
	} );

	test( 'should return false for random texts', () => {
		const content = 'small content';

		expect( isEmptyContent( content ) ).to.eql( false );
	} );
} );
