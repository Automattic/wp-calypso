jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn(),
	select: jest.fn(),
} ) );

import { dispatch, select } from '@wordpress/data';
import { editCurrentPost, readEditedPost } from '../current-post';

const mockSelect = select as jest.Mock;
const mockDispatch = dispatch as jest.Mock;

const editorStore = ( fields: Record< string, unknown > = {} ) => ( {
	getCurrentPostId: () => 7,
	getCurrentPostType: () => 'post',
	getEditedPostAttribute: ( field: string ) => fields[ field ],
} );

beforeEach( () => jest.clearAllMocks() );

describe( 'readEditedPost', () => {
	it( 'reads the post the editor shows with the requested fields, unsaved edits included', () => {
		mockSelect.mockReturnValue( editorStore( { title: 'Draft title', excerpt: 'Draft excerpt' } ) );

		expect( readEditedPost( [ 'excerpt' ] ) ).toEqual( {
			id: 7,
			type: 'post',
			excerpt: 'Draft excerpt',
		} );
		expect( mockSelect ).toHaveBeenCalledWith( 'core/editor' );
	} );

	it( 'reads only the post identity when no field is requested', () => {
		mockSelect.mockReturnValue( editorStore( { title: 'Draft title' } ) );

		expect( readEditedPost( [] ) ).toEqual( { id: 7, type: 'post' } );
	} );

	it( 'reads an unset field as an empty string', () => {
		mockSelect.mockReturnValue( editorStore() );

		expect( readEditedPost( [ 'title' ] ) ).toEqual( { id: 7, type: 'post', title: '' } );
	} );

	const unreadableStores: Array< [ string, unknown ] > = [
		[ 'an editor with no post', { ...editorStore(), getCurrentPostId: () => null } ],
		[ 'an unreadable editor store', undefined ],
		[
			'a store that cannot serve the fields',
			{ getCurrentPostId: () => 7, getCurrentPostType: () => 'post' },
		],
	];

	it.each( unreadableStores )( 'reads %s as undefined', ( _case, store ) => {
		mockSelect.mockReturnValue( store );

		expect( readEditedPost( [ 'title' ] ) ).toBeUndefined();
	} );
} );

describe( 'editCurrentPost', () => {
	it( 'writes the fields outside the editor undo stack', () => {
		const editPost = jest.fn();
		mockDispatch.mockReturnValue( { editPost } );

		editCurrentPost( { title: 'Restored' } );

		expect( mockDispatch ).toHaveBeenCalledWith( 'core/editor' );
		expect( editPost ).toHaveBeenCalledWith( { title: 'Restored' }, { undoIgnore: true } );
	} );

	it( 'throws when the editor store is unavailable', () => {
		mockDispatch.mockReturnValue( undefined );

		expect( () => editCurrentPost( { title: 'Restored' } ) ).toThrow(
			'The post is unavailable to edit.'
		);
	} );
} );
