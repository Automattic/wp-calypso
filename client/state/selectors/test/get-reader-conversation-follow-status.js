/**
 * Internal dependencies
 */
import { getReaderConversationFollowStatus } from 'calypso/state/reader/conversations/selectors';

describe( 'getReaderConversationFollowStatus()', () => {
	test( 'should return F for a known followed post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': 'F',
					},
				},
			},
		};
		const nextState = getReaderConversationFollowStatus( prevState, { siteId: 123, postId: 456 } );
		expect( nextState ).toEqual( 'F' );
	} );

	test( 'should return M for a muted post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': 'M',
					},
				},
			},
		};
		const nextState = getReaderConversationFollowStatus( prevState, { siteId: 123, postId: 456 } );
		expect( nextState ).toEqual( 'M' );
	} );

	test( 'should return null for an unknown post', () => {
		const prevState = {
			reader: {
				conversations: {
					items: {
						'123-456': 'F',
					},
				},
			},
		};
		const nextState = getReaderConversationFollowStatus( prevState, { siteId: 234, postId: 456 } );
		expect( nextState ).toEqual( null );
	} );
} );
