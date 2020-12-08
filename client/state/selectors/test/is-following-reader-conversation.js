/**
 * Internal dependencies
 */
import { isFollowingReaderConversation } from 'calypso/state/reader/conversations/selectors';

describe( 'isFollowingReaderConversation()', () => {
	test( 'should return true for a known followed post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': 'F',
					},
				},
			},
		};
		const nextState = isFollowingReaderConversation( prevState, { siteId: 123, postId: 456 } );
		expect( nextState ).toEqual( true );
	} );

	test( 'should return false for a muted post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': 'M',
					},
				},
			},
		};
		const nextState = isFollowingReaderConversation( prevState, { siteId: 123, postId: 456 } );
		expect( nextState ).toEqual( false );
	} );

	test( 'should return false for an unknown post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': 'F',
					},
				},
			},
		};
		const nextState = isFollowingReaderConversation( prevState, { siteId: 234, postId: 456 } );
		expect( nextState ).toEqual( false );
	} );
} );
