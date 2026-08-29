import { getEditorContentBlocks, getEditorContentSelection, type EditorStore } from './blocks';
import type { BlockSnapshot } from '../components/block-ref';

const rootBlocks: BlockSnapshot[] = [
	{
		clientId: 'header',
		name: 'core/template-part',
		innerBlocks: [],
	},
	{
		clientId: 'post-content',
		name: 'core/post-content',
		innerBlocks: [],
	},
	{
		clientId: 'footer',
		name: 'core/template-part',
		innerBlocks: [],
	},
];

const contentBlocks: BlockSnapshot[] = [
	{
		clientId: 'paragraph',
		name: 'core/paragraph',
		attributes: {
			content: 'Body copy',
		},
	},
];

const postEditor: EditorStore = {
	getCurrentPostId: () => 123,
	getCurrentPostType: () => 'post',
	getRenderingMode: () => 'post-only',
};

const pageSiteEditor: EditorStore = {
	getCurrentPostId: () => 456,
	getCurrentPostType: () => 'page',
	getRenderingMode: () => 'template-locked',
};

describe( 'getEditorContentBlocks', () => {
	it( 'returns controlled post content blocks when a post-content block exists', () => {
		const getBlocks = jest.fn( ( rootClientId?: string ) =>
			rootClientId === 'post-content' ? contentBlocks : rootBlocks
		);

		expect(
			getEditorContentBlocks(
				{
					getBlocks,
					getBlocksByName: jest.fn( () => [ 'post-content' ] ),
				},
				pageSiteEditor
			)
		).toBe( contentBlocks );
		expect( getBlocks ).toHaveBeenCalledWith( 'post-content' );
	} );

	it( 'returns root blocks for a post-only post editor', () => {
		const getBlocks = jest.fn( () => rootBlocks );

		expect(
			getEditorContentBlocks(
				{
					getBlocks,
					getBlocksByName: jest.fn( () => [] ),
				},
				postEditor
			)
		).toBe( rootBlocks );
		expect( getBlocks ).toHaveBeenCalledWith();
	} );

	it( 'returns no blocks when post content is missing in template-locked page editing', () => {
		const getBlocks = jest.fn( () => rootBlocks );

		expect(
			getEditorContentBlocks(
				{
					getBlocks,
					getBlocksByName: jest.fn( () => [] ),
				},
				pageSiteEditor
			)
		).toEqual( [] );
		expect( getBlocks ).not.toHaveBeenCalled();
	} );

	it( 'uses the experimental global block lookup when the stable lookup is unavailable', () => {
		const getBlocks = jest.fn( ( rootClientId?: string ) =>
			rootClientId === 'post-content' ? contentBlocks : rootBlocks
		);

		expect(
			getEditorContentBlocks(
				{
					getBlocks,
					__experimentalGetGlobalBlocksByName: jest.fn( () => [ 'post-content' ] ),
				},
				pageSiteEditor
			)
		).toBe( contentBlocks );
		expect( getBlocks ).toHaveBeenCalledWith( 'post-content' );
	} );

	it( 'returns an empty list when the block editor store is unavailable', () => {
		expect( getEditorContentBlocks( undefined, postEditor ) ).toEqual( [] );
		expect( getEditorContentBlocks( {}, postEditor ) ).toEqual( [] );
	} );

	it.each( [ 'wp_template', 'wp_template_part', 'wp_navigation', 'wp_global_styles' ] )(
		'returns no post content blocks for %s entities',
		( postType ) => {
			const getBlocks = jest.fn( () => rootBlocks );

			expect(
				getEditorContentBlocks(
					{ getBlocks, getBlocksByName: jest.fn( () => [ 'post-content' ] ) },
					{
						getCurrentPostType: () => postType,
						getRenderingMode: () => 'template-locked',
					}
				)
			).toEqual( [] );
			expect( getBlocks ).not.toHaveBeenCalled();
		}
	);
} );

describe( 'getEditorContentSelection', () => {
	const getBlocks = ( rootClientId?: string ) =>
		rootClientId === 'post-content' ? contentBlocks : rootBlocks;

	it( 'returns a selected editable block from the page content tree', () => {
		expect(
			getEditorContentSelection(
				{
					getBlocks,
					getBlocksByName: () => [ 'post-content' ],
					getSelectedBlockClientId: () => 'paragraph',
				},
				pageSiteEditor
			)
		).toEqual( {
			block: contentBlocks[ 0 ],
			clientId: 'paragraph',
			postId: 456,
			postType: 'page',
		} );
	} );

	it( 'uses a stable null post ID for a new unsaved page', () => {
		expect(
			getEditorContentSelection(
				{
					getBlocks,
					getBlocksByName: () => [ 'post-content' ],
					getSelectedBlockClientId: () => 'paragraph',
				},
				{
					...pageSiteEditor,
					getCurrentPostId: () => 0,
				}
			)
		).toMatchObject( { clientId: 'paragraph', postId: null, postType: 'page' } );
	} );

	it( 'rejects a selected template block outside the page content tree', () => {
		expect(
			getEditorContentSelection(
				{
					getBlocks,
					getBlocksByName: () => [ 'post-content' ],
					getSelectedBlockClientId: () => 'header',
				},
				pageSiteEditor
			)
		).toBeNull();
	} );

	it( 'rejects an empty selection', () => {
		expect(
			getEditorContentSelection(
				{
					getBlocks,
					getBlocksByName: () => [ 'post-content' ],
					getSelectedBlockClientId: () => null,
				},
				pageSiteEditor
			)
		).toBeNull();
	} );

	it( 'accepts a remembered selection that remains in post content', () => {
		expect(
			getEditorContentSelection(
				{
					getBlocks,
					getBlocksByName: () => [ 'post-content' ],
					getSelectedBlockClientId: () => null,
				},
				pageSiteEditor,
				'paragraph'
			)
		).toMatchObject( { clientId: 'paragraph', postId: 456, postType: 'page' } );
	} );
} );
