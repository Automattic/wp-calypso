jest.mock( '@wordpress/data', () => ( { select: jest.fn(), dispatch: jest.fn() } ) );
jest.mock( '../private-apis', () => ( { unlock: jest.fn( ( store ) => store ) } ) );

import { dispatch, select } from '@wordpress/data';
import {
	clearBlockSelection,
	DOCUMENT_ROOT_CLIENT_ID,
	getCurrentPost,
	getPaletteColor,
	getRootBlocks,
	isTemplatePartLoaded,
	openUndoLevel,
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
const markLastChangeAsPersistent = jest.fn();
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
		__unstableMarkLastChangeAsPersistent: markLastChangeAsPersistent,
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

it( 'reads a palette colour by slug', () => {
	jest.mocked( select ).mockReturnValue( {
		getSettings: () => ( { colors: [ { slug: 'vivid-red', color: '#cf2e2e' } ] } ),
	} as never );

	expect( getPaletteColor( 'vivid-red' ) ).toBe( '#cf2e2e' );
	expect( getPaletteColor( 'unknown' ) ).toBeUndefined();
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

	// The first write commits the user's own pending change and opens the
	// level; the later ones stay staged until the close folds them in.
	it( 'folds several writes into one undo level', () => {
		withEditor();
		const level = openUndoLevel();
		const write = level.write( replaceInnerBlocks );

		write( 'a', blocks );

		expect( level.hasWritten() ).toBe( true );
		expect( markLastChangeAsPersistent ).toHaveBeenCalledTimes( 1 );
		expect( markNextChangeAsNotPersistent ).not.toHaveBeenCalled();
		expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'a', blocks );

		write( 'b', blocks );
		level.close();

		expect( markNextChangeAsNotPersistent ).toHaveBeenCalledWith();
		expect( markLastChangeAsPersistent ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'closes nothing when nothing was written', () => {
		withEditor();
		const level = openUndoLevel();

		level.close();

		expect( level.hasWritten() ).toBe( false );
		expect( markLastChangeAsPersistent ).not.toHaveBeenCalled();
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

describe( 'isTemplatePartLoaded', () => {
	const PART_ID = 'assembler//footer';

	function withPart( {
		blocks = [],
		attributes = { slug: 'footer', theme: 'assembler' },
		resolved = true,
		record,
	}: {
		blocks?: EditorBlock[];
		attributes?: Record< string, unknown >;
		resolved?: boolean;
		record?: { blocks?: unknown[]; content?: unknown };
	} ) {
		const hasFinishedResolution = jest.fn( () => resolved );
		const getEditedEntityRecord = jest.fn( () => record );

		jest.mocked( select ).mockImplementation( ( store ) =>
			store === 'core/block-editor'
				? ( {
						getBlocks: () => blocks,
						getBlock: () => ( { ...block( 'footer', 'core/template-part' ), attributes } ),
					} as never )
				: ( {
						getCurrentTheme: () => ( { stylesheet: 'assembler' } ),
						hasFinishedResolution,
						getEditedEntityRecord,
					} as never )
		);

		return { hasFinishedResolution, getEditedEntityRecord };
	}

	it( 'holds once the part has blocks in the tree', () => {
		withPart( { blocks: [ block( 'credit', 'core/paragraph' ) ], resolved: false } );

		expect( isTemplatePartLoaded( 'footer' ) ).toBe( true );
	} );

	it( 'does not hold while the entity is resolving', () => {
		const { hasFinishedResolution } = withPart( { resolved: false } );

		expect( isTemplatePartLoaded( 'footer' ) ).toBe( false );
		expect( hasFinishedResolution ).toHaveBeenCalledWith( 'getEditedEntityRecord', [
			'postType',
			'wp_template_part',
			PART_ID,
		] );
	} );

	it.each( [
		{ case: 'saved with no content', record: { content: '' }, expected: true },
		{ case: 'edited to no blocks', record: { blocks: [], content: () => '' }, expected: true },
		{ case: 'missing', record: undefined, expected: true },
		{ case: 'saved with no raw content', record: { content: { raw: '' } }, expected: true },
		{
			case: 'saved with raw blocks the tree does not hold yet',
			record: { content: { raw: '<!-- wp:site-title /-->' } },
			expected: false,
		},
		{
			case: 'saved with blocks the tree does not hold yet',
			record: { content: '<!-- wp:paragraph --><p>Credit</p><!-- /wp:paragraph -->' },
			expected: false,
		},
		{
			case: 'edited to blocks the tree does not hold yet',
			record: { blocks: [ {} ] },
			expected: false,
		},
	] )( 'reads a resolved part $case as loaded: $expected', ( { record, expected } ) => {
		withPart( { record } );

		expect( isTemplatePartLoaded( 'footer' ) ).toBe( expected );
	} );

	// Core's block keys the entity the same way.
	it( 'keys a part that names no theme under the active one', () => {
		const { getEditedEntityRecord } = withPart( { attributes: { slug: 'footer' }, record: {} } );

		expect( isTemplatePartLoaded( 'footer' ) ).toBe( true );
		expect( getEditedEntityRecord ).toHaveBeenCalledWith( 'postType', 'wp_template_part', PART_ID );
	} );

	it( 'does not hold for a part with no slug', () => {
		withPart( { attributes: {}, record: {} } );

		expect( isTemplatePartLoaded( 'footer' ) ).toBe( false );
	} );
} );
