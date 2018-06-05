/** @format */

/**
 * Internal dependencies
 */
import isRememberedPost from 'state/selectors/is-remembered-post';
import { READER_REMEMBERED_POSTS_STATUS } from 'state/reader/remembered-posts/status';

describe( 'isRememberedPost()', () => {
	test( 'should return true for a known remembered post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': READER_REMEMBERED_POSTS_STATUS.remembered,
					},
				},
			},
		};
		const nextState = isRememberedPost( prevState, { siteId: 123, postId: 456 } );
		expect( nextState ).toEqual( true );
	} );

	test( 'should return false for a forgotten post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': READER_REMEMBERED_POSTS_STATUS.forgotten,
					},
				},
			},
		};
		const nextState = isRememberedPost( prevState, { siteId: 123, postId: 456 } );
		expect( nextState ).toEqual( false );
	} );
} );
