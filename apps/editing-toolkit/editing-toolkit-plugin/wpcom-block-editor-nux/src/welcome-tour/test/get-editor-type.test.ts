import { getEditorType } from '../get-editor-type';

jest.mock( '@wordpress/data', () => {
	return {
		select: jest.fn(),
	};
} );

const { select } = jest.requireMock( '@wordpress/data' );

describe( 'getEditorType', () => {
	it( 'should return `post`', () => {
		( select as jest.Mock ).mockImplementationOnce( () => {
			return {
				getCurrentPostType: () => 'post',
			};
		} );
		expect( getEditorType() ).toEqual( 'post' );
	} );
	it( 'should return `page`', () => {
		( select as jest.Mock ).mockImplementationOnce( () => {
			return {
				getCurrentPostType: () => 'page',
			};
		} );
		expect( getEditorType() ).toEqual( 'page' );
	} );
	it( 'should return `site` when the post type is `null`', () => {
		( select as jest.Mock ).mockImplementationOnce( () => {
			return {
				getCurrentPostType: () => null,
			};
		} );
		expect( getEditorType() ).toEqual( 'site' );
	} );
} );
