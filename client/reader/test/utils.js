/**
 * @jest-environment jsdom
 */

import page from 'page';
import { showSelectedPost } from '../utils';

jest.mock( 'page', () => ( {
	show: jest.fn(),
} ) );
jest.mock( 'calypso/lib/redux-bridge', () => ( {
	reduxGetState: function () {
		return { reader: { posts: { items: {} } } };
	},
} ) );

describe( 'reader utils', () => {
	beforeEach( () => {
		page.show.mockReset();
	} );

	describe( '#showSelectedPost', () => {
		test( 'does not do anything if postKey argument is missing', () => {
			showSelectedPost( {} );
			expect( page.show ).not.toBeCalled();
		} );

		test( 'redirects if passed a post key', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 } } );
			expect( page.show ).toBeCalledTimes( 1 );
		} );

		test( 'redirects to a #comments URL if we passed comments argument', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 }, comments: true } );
			expect( page.show ).toBeCalledWith( '/read/feeds/1/posts/5#comments' );
		} );
	} );
} );
