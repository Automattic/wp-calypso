/**
 * @jest-environment jsdom
 */

import page from 'page';
import { showSelectedPost } from '../utils';

jest.mock( 'page', () => jest.fn() );

describe( 'reader utils', () => {
	const dispatch = jest.fn();
	const getState = () => ( {
		reader: {
			posts: {
				items: {},
			},
		},
	} );

	beforeEach( () => {
		page.mockReset();
	} );

	describe( '#showSelectedPost', () => {
		test( 'does not do anything if postKey argument is missing', () => {
			showSelectedPost( {} )( dispatch, getState );
			expect( page ).not.toBeCalled();
		} );

		test( 'redirects if passed a post key', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 } } )( dispatch, getState );
			expect( page ).toBeCalledTimes( 1 );
		} );

		test( 'redirects to a #comments URL if we passed comments argument', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 }, comments: true } )(
				dispatch,
				getState
			);
			expect( page ).toBeCalledWith( '/read/feeds/1/posts/5#comments' );
		} );
	} );
} );
