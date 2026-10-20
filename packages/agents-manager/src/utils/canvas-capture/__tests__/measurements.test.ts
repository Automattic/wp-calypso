jest.mock( '../../block-ids', () => ( {
	createShortIdLookup: () => ( { findShortId: ( clientId: string ) => clientId } ),
} ) );
jest.mock( '../../editor-blocks', () => ( {
	getBlock: jest.fn(),
	getBlockRootClientId: jest.fn(),
	getBlocks: jest.fn(),
} ) );

import { getBlock, getBlockRootClientId, getBlocks } from '../../editor-blocks';
import { describeMeasuredLayout, describeUnmoved, snapshotLayout } from '../measurements';
import type { EditorBlock } from '../../editor-blocks';

interface Rect {
	top: number;
	left: number;
	width: number;
	height: number;
}

const toDomRect = ( { top, left, width, height }: Rect ) =>
	( { top, left, width, height, bottom: top + height, right: left + width } ) as DOMRect;

interface CanvasBlock {
	clientId: string;
	name: string;
	rect: Rect;
	/** A lone image, as the block's only content. */
	image?: Rect;
	text?: string;
	/** Builds the block's own markup instead, for the editor's real nesting. */
	build?: ( element: HTMLElement, canvasDocument: Document ) => void;
	children?: CanvasBlock[];
}

const withRect = < T extends HTMLElement >( element: T, rect: Rect ): T => {
	element.getBoundingClientRect = () => toDomRect( rect );

	return element;
};

/** Mounts the canvas with the blocks laid out at the given boxes, and the editor store to match. */
function mountCanvas( roots: CanvasBlock[] ) {
	document.body.innerHTML = '';

	const frame = document.createElement( 'iframe' );
	frame.name = 'editor-canvas';
	document.body.append( frame );

	const canvasDocument = frame.contentDocument as Document;
	const store: Record< string, { block: CanvasBlock; parent?: string } > = {};

	const mount = ( block: CanvasBlock, container: HTMLElement, parent?: string ) => {
		const element = withRect( canvasDocument.createElement( 'div' ), block.rect );
		element.setAttribute( 'data-block', block.clientId );

		if ( block.image ) {
			element.append( withRect( canvasDocument.createElement( 'img' ), block.image ) );
		}

		if ( block.text ) {
			element.append( block.text );
		}

		block.build?.( element, canvasDocument );
		container.append( element );
		store[ block.clientId ] = { block, parent };
		block.children?.forEach( ( child ) => mount( child, element, block.clientId ) );
	};

	roots.forEach( ( root ) => mount( root, canvasDocument.body ) );

	const toEditorBlock = ( block: CanvasBlock ): EditorBlock => ( {
		clientId: block.clientId,
		name: block.name,
		attributes: {},
		innerBlocks: ( block.children ?? [] ).map( toEditorBlock ),
	} );

	jest
		.mocked( getBlock )
		.mockImplementation( ( id ) => store[ id ] && toEditorBlock( store[ id ].block ) );
	jest
		.mocked( getBlocks )
		.mockImplementation(
			( id ) => ( id && store[ id ]?.block.children?.map( toEditorBlock ) ) || []
		);
	jest.mocked( getBlockRootClientId ).mockImplementation( ( id ) => store[ id ]?.parent );
}

const LOGO_BLOCK = { top: 25, left: 0, width: 140, height: 140 };

/** A site logo as the editor renders it: resize container, its handles, a link, then the image. */
const editorSiteLogo =
	( image: Rect | null ) => ( element: HTMLElement, canvasDocument: Document ) => {
		const container = withRect( canvasDocument.createElement( 'div' ), LOGO_BLOCK );
		container.className = 'components-resizable-box__container';

		const handle = canvasDocument.createElement( 'div' );
		handle.className = 'components-resizable-box__handle';

		const link = canvasDocument.createElement( 'a' );

		if ( image ) {
			link.append( withRect( canvasDocument.createElement( 'img' ), image ) );
		}

		container.append( link, handle );
		element.className = 'wp-block-site-logo';
		element.append( container );
	};

/**
 * The header of the trace this was written for. The logo and title row sits
 * two levels below the outer row, and the logo block is 140px square whatever
 * the image inside it shows: with the bug, a 70px image at the block's top.
 */
const header = ( logo: Pick< CanvasBlock, 'image' | 'build' > ): CanvasBlock => ( {
	clientId: '6DIe',
	name: 'core/group',
	rect: { top: 0, left: 0, width: 1000, height: 190 },
	children: [
		{
			clientId: '7PkW',
			name: 'core/group',
			rect: { top: 25, left: 0, width: 400, height: 140 },
			children: [
				{
					clientId: 'zteD',
					name: 'core/group',
					rect: { top: 25, left: 0, width: 400, height: 140 },
					children: [
						{ clientId: 'qUl-', name: 'core/site-logo', rect: LOGO_BLOCK, ...logo },
						{
							clientId: '_RgQ',
							name: 'core/site-title',
							rect: { top: 86, left: 160, width: 200, height: 18 },
							text: 'My Site',
						},
					],
				},
			],
		},
		{
			clientId: 'YqQx',
			name: 'core/group',
			rect: { top: 76, left: 600, width: 400, height: 38 },
			children: [
				{
					clientId: 'nav',
					name: 'core/navigation',
					rect: { top: 76, left: 600, width: 250, height: 38 },
					text: 'Menu',
				},
				{
					clientId: 'btn',
					name: 'core/buttons',
					rect: { top: 76, left: 870, width: 130, height: 38 },
					text: 'Shop',
				},
			],
		},
	],
} );

const CAPPED_IMAGE = { top: 25, left: 35, width: 70, height: 70 };
const FULL_IMAGE = { top: 25, left: 0, width: 140, height: 140 };
const EDITED = [ '6DIe', '7PkW', 'YqQx' ];

const rowIn = ( notes: string[], clientId: string ) =>
	notes.find( ( note ) => note.startsWith( `Row in group (${ clientId })` ) );

afterEach( () => {
	document.body.innerHTML = '';
	jest.resetAllMocks();
} );

describe( 'with a small image at the top of its logo block', () => {
	it( 'notes the block against its image, though the logo is a great-grandchild of the edit', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		expect( describeMeasuredLayout( EDITED ) ).toContain(
			'site-logo (qUl-): block 140×140, image 70×70 at the top of it.'
		);
	} );

	it( 'measures the logo and title row and reports it not level', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		const row = rowIn( describeMeasuredLayout( EDITED ), 'zteD' );

		expect( row ).toContain( 'site-logo (qUl-) 0–70, site-title (_RgQ) 61–79' );
		expect( row ).toContain( 'not level' );
		expect( row ).toContain( "site-title (_RgQ)'s is 35px below it" );
	} );

	it( 'judges a group by what its children show, not by its own box', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		const row = rowIn( describeMeasuredLayout( EDITED ), '6DIe' );

		expect( row ).toContain( 'group (7PkW) 25–104, group (YqQx) 76–114' );
		expect( row ).toContain( 'not level' );
	} );

	it( 'puts the row holding the image first', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		const rows = describeMeasuredLayout( EDITED ).filter( ( note ) => note.startsWith( 'Row in' ) );

		expect( rows[ 0 ] ).toMatch( /^Row in group \(zteD\)/ );
	} );

	it( 'finds the same row from the outermost edited block alone', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		expect( rowIn( describeMeasuredLayout( [ '6DIe' ] ), 'zteD' ) ).toContain( 'not level' );
	} );

	it( 'measures the row around an edited item', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		expect( rowIn( describeMeasuredLayout( [ 'qUl-' ] ), 'zteD' ) ).toContain( 'not level' );
	} );
} );

describe( 'with the editor’s own site logo markup', () => {
	it( 'measures the image inside the resize container, not the container', () => {
		mountCanvas( [ header( { build: editorSiteLogo( CAPPED_IMAGE ) } ) ] );

		const notes = describeMeasuredLayout( EDITED );

		expect( notes ).toContain( 'site-logo (qUl-): block 140×140, image 70×70 at the top of it.' );
		expect( rowIn( notes, 'zteD' ) ).toContain( "not level. Against site-logo (qUl-)'s" );
	} );

	it( 'says nothing of the logo, or of any row holding it, when its image cannot be read', () => {
		mountCanvas( [ header( { build: editorSiteLogo( null ) } ) ] );

		const notes = describeMeasuredLayout( EDITED );

		expect( notes ).not.toContainEqual( expect.stringContaining( 'site-logo' ) );
		expect( rowIn( notes, 'zteD' ) ).toBeUndefined();
		expect( rowIn( notes, '6DIe' ) ).toBeUndefined();
		// The row with no logo in it is still known.
		expect( rowIn( notes, 'YqQx' ) ).toContain( 'are level' );
	} );
} );

describe( 'with an image that fills its logo block', () => {
	it( 'writes no block-versus-image note', () => {
		mountCanvas( [ header( { image: FULL_IMAGE } ) ] );

		expect( describeMeasuredLayout( EDITED ) ).not.toContainEqual(
			expect.stringContaining( 'block 140×140' )
		);
	} );

	it( 'reports every row level', () => {
		mountCanvas( [ header( { image: FULL_IMAGE } ) ] );

		const notes = describeMeasuredLayout( EDITED );

		expect( rowIn( notes, 'zteD' ) ).toContain( 'Their visible centre lines are level' );
		expect( notes ).toHaveLength( 3 );
		notes.forEach( ( note ) => expect( note ).toContain( 'are level' ) );
	} );
} );

it( 'says nothing of children stacked one above the other', () => {
	mountCanvas( [
		{
			clientId: 'stack',
			name: 'core/group',
			rect: { top: 0, left: 0, width: 600, height: 200 },
			children: [
				{
					clientId: 'h',
					name: 'core/heading',
					rect: { top: 0, left: 0, width: 600, height: 50 },
					text: 'Hi',
				},
				{
					clientId: 'p',
					name: 'core/paragraph',
					rect: { top: 60, left: 0, width: 600, height: 50 },
					text: 'There',
				},
			],
		},
	] );

	expect( describeMeasuredLayout( [ 'stack' ] ) ).toEqual( [] );
} );

it( 'gives nothing when the canvas is not mounted', () => {
	expect( describeMeasuredLayout( EDITED ) ).toEqual( [] );
} );

it( 'gives nothing rather than throwing when the editor cannot be read', () => {
	mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );
	jest.mocked( getBlocks ).mockImplementation( () => {
		throw new Error( 'No store' );
	} );
	jest.spyOn( console, 'error' ).mockImplementation( () => {} );

	expect( describeMeasuredLayout( EDITED ) ).toEqual( [] );
} );

describe( 'whether anything moved', () => {
	it( 'says so when nothing the edit named moved', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		const snapshot = snapshotLayout( [ 'zteD' ] );

		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		expect( describeUnmoved( snapshot! ) ).toBe(
			'No edited block moved: group (zteD) and its children are where they were before the edit.'
		);
	} );

	it( 'names every edited block', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		const snapshot = snapshotLayout( [ 'zteD', 'YqQx' ] );

		expect( describeUnmoved( snapshot! ) ).toContain(
			'group (zteD), group (YqQx) and their children are'
		);
	} );

	it( 'says nothing when a child moved', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		const snapshot = snapshotLayout( [ 'zteD' ] );

		mountCanvas( [ header( { image: FULL_IMAGE } ) ] );

		expect( describeUnmoved( snapshot! ) ).toBe( '' );
	} );

	it( 'says nothing when an edited block is gone, as one replaced is', () => {
		mountCanvas( [ header( { image: CAPPED_IMAGE } ) ] );

		const snapshot = snapshotLayout( [ 'YqQx' ] );

		mountCanvas( [] );

		expect( describeUnmoved( snapshot! ) ).toBe( '' );
	} );

	it( 'takes no reading when a box cannot be read', () => {
		mountCanvas( [ header( { build: editorSiteLogo( null ) } ) ] );

		expect( snapshotLayout( [ 'zteD' ] ) ).toBeNull();
	} );
} );
