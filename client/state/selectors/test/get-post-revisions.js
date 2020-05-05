/**
 * Internal dependencies
 */
import getPostRevisions from 'state/selectors/get-post-revisions';

describe( 'getPostRevisions', () => {
	const SITE_ID = 12345678;
	const POST_ID = 10;

	const stateWithRevisions = ( revisions ) => ( {
		posts: {
			revisions: {
				diffs: {
					[ SITE_ID ]: {
						[ POST_ID ]: {
							revisions,
						},
					},
				},
			},
		},
	} );

	test( 'should return an empty array if there is no revision in the state for `siteId, postId`', () => {
		expect( getPostRevisions( stateWithRevisions( {} ), SITE_ID, POST_ID ) ).toEqual( [] );
	} );

	test( 'should return a sorted array of revisions', () => {
		const revisions = {
			168: {
				post_date_gmt: '2017-12-12 18:24:37Z',
				post_modified_gmt: '2017-12-12 18:24:37Z',
				post_author: '20416304',
				id: 168,
				post_content: 'This is a super cool test!\nOh rly? Ya rly',
				post_excerpt: '',
				post_title: 'Yet Another Awesome Test Post!',
			},
			169: {
				post_date_gmt: '2017-12-14 18:24:37Z',
				post_modified_gmt: '2017-12-14 18:24:37Z',
				post_author: '20416304',
				id: 169,
				post_content: 'This is a super duper cool test!\nOh rly? Ya rly',
				post_excerpt: '',
				post_title: 'Yet Another Awesome Test Post!',
			},
			170: {
				// identical to id:169
				post_date_gmt: '2017-12-14 18:24:37Z',
				post_modified_gmt: '2017-12-14 18:24:37Z',
				post_author: '20416304',
				id: 170,
				post_content: 'This is a super duper cool test!\nOh rly? Ya rly',
				post_excerpt: '',
				post_title: 'Yet Another Awesome Test Post!',
			},
		};

		const sortedRevisions = getPostRevisions( stateWithRevisions( revisions ), SITE_ID, POST_ID );
		const sortedRevisionIds = sortedRevisions.map( ( revision ) => revision.id );

		// revisions with the same `post_modified_gmt` timestamp should be further desc-sorted by ID
		expect( sortedRevisionIds ).toEqual( [ 170, 169, 168 ] );
	} );
} );
