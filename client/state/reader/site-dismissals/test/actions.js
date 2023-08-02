import { READER_DISMISS_POST, READER_DISMISS_SITE } from 'calypso/state/reader/action-types';
import { dismissPost, dismissSite } from 'calypso/state/reader/site-dismissals/actions';

describe( 'actions', () => {
	describe( '#dismissPost', () => {
		test( 'should return an action when a post is dismissed', () => {
			const streamKey = 'banana';
			const postKey = { blogId: 123, postId: 456 };
			const action = dismissPost( { streamKey, postKey } );
			expect( action ).toEqual( {
				type: READER_DISMISS_POST,
				payload: { streamKey, postKey, siteId: postKey.blogId },
			} );
		} );
	} );

	describe( '#dismissSite', () => {
		test( 'should return an action when a site is dismissed', () => {
			const action = dismissSite( { siteId: 123, seed: 456 } );
			expect( action ).toEqual( {
				type: READER_DISMISS_SITE,
				payload: { siteId: 123 },
				seed: 456,
			} );
		} );
	} );
} );
