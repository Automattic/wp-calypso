/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getReaderConversationFollowStatus } from '../';

describe( 'getReaderConversationFollowStatus()', () => {
	test( 'should return follow status for a known post', () => {
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
