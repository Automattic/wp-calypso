/**
 * @jest-environment jsdom
 */
import { select } from '@wordpress/data';
import { getEditorPostContext } from '../editor-post-context';

jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );

describe( 'getEditorPostContext', () => {
	it.each( [
		{
			case: 'adds the post as an entity on post.php',
			path: '/wp-admin/post.php?post=42&action=edit',
			expected: {
				current_page_id: 42,
				id: 'post',
				type: 'entity',
				entityType: 'post',
				entityId: '42',
			},
		},
		{
			case: 'sends only the post id in the other editors',
			path: '/wp-admin/site-editor.php',
			expected: { current_page_id: 42 },
		},
	] )( '$case', ( { path, expected } ) => {
		jest.mocked( select ).mockReturnValue( { getCurrentPostId: () => 42 } as never );
		window.history.replaceState( {}, '', path );

		expect( getEditorPostContext() ).toEqual( expected );
	} );
} );
