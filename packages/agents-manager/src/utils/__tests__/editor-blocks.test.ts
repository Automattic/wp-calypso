jest.mock( '@wordpress/data', () => ( { select: jest.fn(), dispatch: jest.fn() } ) );
jest.mock( '../private-apis', () => ( { unlock: jest.fn( ( store ) => store ) } ) );

import { dispatch, select } from '@wordpress/data';
import {
	clearBlockSelection,
	DOCUMENT_ROOT_CLIENT_ID,
	getCurrentPost,
	getRootBlocks,
	replaceRootBlocks,
	resolveBlocksRoot,
	stageRootBlocks,
	type EditorBlock,
} from '../editor-blocks';

const block = ( clientId: string, name: string ): EditorBlock => ( {
	clientId,
	name,
	attributes: {},
	innerBlocks: [],
} );

const replaceInnerBlocks = jest.fn();
const resetBlocks = jest.fn();
const markNextChangeAsNotPersistent = jest.fn();
const clearSelectedBlock = jest.fn();

function withEditor( {
	blocks = [],
	postContent,
	sectionRoot,
	postId,
	title,
}: {
	blocks?: EditorBlock[];
	postContent?: string;
	sectionRoot?: string;
	postId?: number;
	title?: string;
} = {} ) {
	( select as jest.Mock ).mockImplementation( ( store: string ) =>
		store === 'core/block-editor'
			? {
					getBlocks: ( root?: string ) => ( root ? [] : blocks ),
					getBlocksByName: ( name: string ) =>
						name === 'core/post-content' && postContent ? [ postContent ] : [],
					getSectionRootClientId: () => sectionRoot,
				}
			: {
					getCurrentPostId: () => postId,
					getCurrentPostType: () => 'page',
					getEditedPostAttribute: ( attribute: string ) =>
						attribute === 'title' ? title : undefined,
				}
	);
	( dispatch as jest.Mock ).mockReturnValue( {
		replaceInnerBlocks,
		resetBlocks,
		clearSelectedBlock,
		__unstableMarkNextChangeAsNotPersistent: markNextChangeAsNotPersistent,
	} );
}

beforeEach( () => jest.clearAllMocks() );

describe( 'resolveBlocksRoot', () => {
	it.each( [
		{
			case: 'the section container first',
			editor: { sectionRoot: 'section', postContent: 'pc', postId: 1 },
			expected: { kind: 'section', clientId: 'section', post: { id: 1, type: 'page' } },
		},
		{
			case: 'the post-content block',
			editor: { postContent: 'pc', postId: 1 },
			expected: { kind: 'post-content', clientId: 'pc', post: { id: 1, type: 'page' } },
		},
		{
			case: 'the document root',
			editor: { postId: 1 },
			expected: {
				kind: 'document',
				clientId: DOCUMENT_ROOT_CLIENT_ID,
				post: { id: 1, type: 'page' },
			},
		},
		{
			case: 'nothing while the editor holds no post, whatever the root',
			editor: { sectionRoot: 'section' },
			expected: null,
		},
	] )( 'picks $case', ( { editor, expected } ) => {
		withEditor( editor );

		expect( resolveBlocksRoot() ).toEqual( expected );
	} );
} );

it( 'reads the document root as the top-level blocks', () => {
	withEditor( { blocks: [ block( 'a', 'core/paragraph' ) ] } );

	expect( getRootBlocks( DOCUMENT_ROOT_CLIENT_ID ) ).toEqual( [ block( 'a', 'core/paragraph' ) ] );
	expect( getRootBlocks( 'a' ) ).toEqual( [] );
} );

it( 'reads the post the editor holds', () => {
	withEditor( { postId: 7, title: 'About' } );

	expect( getCurrentPost() ).toEqual( { id: 7, type: 'page', title: 'About' } );
} );

describe( 'writes', () => {
	const blocks = [ block( 'b', 'core/heading' ) ];

	it( 'resets the document root and replaces the inner blocks of any other root', () => {
		withEditor();

		replaceRootBlocks( DOCUMENT_ROOT_CLIENT_ID, blocks );
		replaceRootBlocks( 'pc', blocks );

		expect( resetBlocks ).toHaveBeenCalledWith( blocks );
		expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'pc', blocks, false );
	} );

	it( 'stages outside the undo stack, mark and write in one batch', () => {
		withEditor();
		const queued: ( () => void )[] = [];
		const batch = jest.fn( ( run: () => void ) => queued.push( run ) );

		stageRootBlocks( 'pc', blocks, batch );

		expect( batch ).toHaveBeenCalledTimes( 1 );
		expect( replaceInnerBlocks ).not.toHaveBeenCalled();

		queued[ 0 ]();

		expect( markNextChangeAsNotPersistent ).toHaveBeenCalledWith( { history: 'ignore' } );
		expect( markNextChangeAsNotPersistent.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			replaceInnerBlocks.mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'stages at once without a batch', () => {
		withEditor();

		stageRootBlocks( 'pc', blocks );

		expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'pc', blocks, false );
	} );

	it( 'refuses to write, and clears no selection, without the block editor', () => {
		( dispatch as jest.Mock ).mockReturnValue( undefined );

		expect( () => replaceRootBlocks( 'pc', blocks ) ).toThrow( 'unavailable' );
		expect( () => clearBlockSelection() ).not.toThrow();
	} );

	it( 'clears the block selection', () => {
		withEditor();

		clearBlockSelection();

		expect( clearSelectedBlock ).toHaveBeenCalled();
	} );
} );
