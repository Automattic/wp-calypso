import { getCommentAdminPath } from '../';

jest.mock( 'calypso/controller', () => ( {} ) );
jest.mock( 'calypso/my-sites/controller', () => ( {} ) );

describe( 'getCommentAdminPath', () => {
	test.each( [ 'approve', 'trash', 'spam', 'delete' ] )( 'keeps the %s action', ( action ) => {
		expect( getCommentAdminPath( { query: { action } } ) ).toBe( `comment.php?action=${ action }` );
	} );

	test( 'opens the editor when there is no action', () => {
		expect( getCommentAdminPath( { query: {} } ) ).toBe( 'comment.php?action=editcomment' );
	} );

	test( 'opens the editor for an unknown action', () => {
		expect( getCommentAdminPath( { query: { action: 'deletecomment' } } ) ).toBe(
			'comment.php?action=editcomment'
		);
	} );
} );
