jest.mock( '../block-ids', () => ( {
	createShortIdLookup: jest.fn(),
	setMenuItemAttributes: jest.fn(),
} ) );
jest.mock( '../editor-blocks', () => ( {
	TEMPLATE_PART_BLOCK: 'core/template-part',
	getBlock: jest.fn(),
	getBlockParents: jest.fn(),
	getBlocks: jest.fn(),
	getCurrentPost: jest.fn(),
	getSectionRootClientId: jest.fn(),
	getSelectedBlockClientId: jest.fn(),
	getTemplatePartClientIds: jest.fn(),
} ) );
jest.mock( '../navigation-menu', () => ( {
	NAVIGATION_BLOCK: 'core/navigation',
	getLoadedMenuItems: jest.fn(),
	isMenuItem: ( block: { name?: string } ) =>
		block.name === 'core/navigation-link' || block.name === 'core/navigation-submenu',
} ) );

import { createShortIdLookup, setMenuItemAttributes } from '../block-ids';
import * as editorBlocks from '../editor-blocks';
import { getLoadedMenuItems } from '../navigation-menu';
import { getPageStructure, type PageStructure } from '../page-structure';
import type { EditorBlock } from '../editor-blocks';

const editor = jest.mocked( editorBlocks );

const block = (
	clientId: string,
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: EditorBlock[] = []
): EditorBlock => ( { clientId, name, attributes, innerBlocks } );

const templatePart = ( clientId: string, slug: string ) =>
	block( clientId, 'core/template-part', { slug } );

/**
 * Serves `blocks` as the editor's tree. `controlled` holds what the editor
 * keeps apart from it: the blocks of each template part, by its clientId.
 */
function withEditor( {
	blocks,
	controlled = {},
	sectionRoot,
	selected,
}: {
	blocks: EditorBlock[];
	controlled?: Record< string, EditorBlock[] >;
	sectionRoot?: string;
	selected?: string;
} ) {
	const byId = new Map< string, EditorBlock >();
	const parents = new Map< string, string[] >();
	const childrenOf = ( parent: EditorBlock ) => controlled[ parent.clientId ] ?? parent.innerBlocks;
	const index = ( list: EditorBlock[], ancestors: string[] ) =>
		list.forEach( ( item ) => {
			byId.set( item.clientId, item );
			parents.set( item.clientId, ancestors );
			index( childrenOf( item ), [ ...ancestors, item.clientId ] );
		} );

	index( blocks, [] );

	editor.getBlock.mockImplementation( ( clientId ) => byId.get( clientId ) );
	editor.getBlockParents.mockImplementation( ( clientId ) => parents.get( clientId ) ?? [] );
	editor.getBlocks.mockImplementation( ( clientId ) =>
		clientId ? childrenOf( byId.get( clientId )! ) : blocks
	);
	editor.getTemplatePartClientIds.mockImplementation( () =>
		[ ...byId.values() ]
			.filter( ( item ) => item.name === 'core/template-part' )
			.map( ( item ) => ( { slug: String( item.attributes.slug ), clientId: item.clientId } ) )
	);
	editor.getSectionRootClientId.mockReturnValue( sectionRoot );
	editor.getCurrentPost.mockReturnValue( { id: 1, type: 'page' } );
	editor.getSelectedBlockClientId.mockReturnValue( selected );
}

/** The structure as `[ type, clientId, children… ]` rows, enough to tell its shape. */
const outline = ( blocks: PageStructure[ 'currentPageContent' ] ): unknown[] =>
	blocks.map( ( { type, clientId, innerBlocks } ) => [
		...( type ? [ type ] : [] ),
		clientId,
		...outline( innerBlocks ),
	] );

const pageOutline = () => outline( getPageStructure()?.currentPageContent ?? [] );

// Reset, not cleared: every mock here is armed by `beforeEach` or by the test.
beforeEach( () => {
	jest.resetAllMocks();

	const shortened = new Set< string >();

	jest.mocked( createShortIdLookup ).mockReturnValue( {
		toShortId: ( clientId ) => {
			shortened.add( clientId );

			return `s:${ clientId }`;
		},
		findShortId: ( clientId ) => ( shortened.has( clientId ) ? `s:${ clientId }` : undefined ),
	} );
} );

it( 'splits a templated page into header, content and footer, under short ids', () => {
	withEditor( {
		blocks: [
			templatePart( 'header', 'header' ),
			block( 'main', 'core/group', { tagName: 'main' }, [
				block( 'hero', 'core/cover' ),
				templatePart( 'sidebar', 'sidebar' ),
			] ),
			templatePart( 'footer', 'footer' ),
		],
		controlled: {
			header: [ block( 'logo', 'core/site-logo' ) ],
			sidebar: [ block( 'search', 'core/search' ) ],
			footer: [ block( 'credit', 'core/paragraph' ) ],
		},
		sectionRoot: 'main',
	} );

	const { currentPageContent } = getPageStructure()!;

	expect( outline( currentPageContent ) ).toEqual( [
		[ 'header', 's:header', [ 's:logo' ] ],
		[ 'content', 's:main', [ 's:hero' ], [ 's:sidebar', [ 's:search' ] ] ],
		[ 'footer', 's:footer', [ 's:credit' ] ],
	] );
	// The backend reads a region by its `type`; only a part carries attributes.
	expect( currentPageContent[ 0 ] ).toMatchObject( {
		name: 'core/template-part',
		attributes: { slug: 'header' },
	} );
	expect( currentPageContent[ 1 ] ).toEqual( {
		name: 'core/group',
		type: 'content',
		clientId: 's:main',
		innerBlocks: expect.any( Array ),
	} );
} );

it( 'takes the hero header over the plain one, and leaves out a part with no blocks', () => {
	withEditor( {
		blocks: [
			templatePart( 'header', 'header' ),
			templatePart( 'header-hero', 'header-hero' ),
			block( 'main', 'core/group' ),
			templatePart( 'footer', 'footer' ),
		],
		controlled: {
			header: [ block( 'logo', 'core/site-logo' ) ],
			'header-hero': [ block( 'headline', 'core/heading' ) ],
		},
		sectionRoot: 'main',
	} );

	expect( pageOutline() ).toEqual( [
		[ 'header', 's:header-hero', [ 's:headline' ] ],
		[ 'content', 's:main' ],
	] );
} );

// No section root, as in the post editor: no regions, whatever the page holds.
it( 'sends the blocks as they are without a section root', () => {
	withEditor( {
		blocks: [
			block( 'wrapper', 'core/group', {}, [
				templatePart( 'header', 'header' ),
				block( 'intro', 'core/paragraph' ),
			] ),
			block( 'gallery', 'core/gallery' ),
		],
		controlled: { header: [ block( 'logo', 'core/site-logo' ) ] },
	} );

	expect( pageOutline() ).toEqual( [
		[ 's:wrapper', [ 's:header', [ 's:logo' ] ], [ 's:intro' ] ],
		[ 's:gallery' ],
	] );
} );

describe( 'a template part inside a wrapper', () => {
	// A cover around the header carries the headline as its own child; naming
	// the bare part would leave that copy in no region at all.
	it( 'widens the region to the wrapper', () => {
		withEditor( {
			blocks: [
				block( 'cover', 'core/cover', { url: 'hero.jpg' }, [
					templatePart( 'header', 'header' ),
					block( 'headline', 'core/heading' ),
				] ),
				block( 'main', 'core/group' ),
			],
			controlled: { header: [ block( 'logo', 'core/site-logo' ) ] },
			sectionRoot: 'main',
		} );

		const [ header ] = getPageStructure()!.currentPageContent;

		expect( header ).toMatchObject( { name: 'core/cover', attributes: { url: 'hero.jpg' } } );
		expect( outline( [ header ] ) ).toEqual( [
			[ 'header', 's:cover', [ 's:header', [ 's:logo' ] ], [ 's:headline' ] ],
		] );
	} );

	// A wrapper that holds the content too is no region, and one both parts
	// share is the header's alone.
	it.each( [
		{
			case: 'stops short of a wrapper that holds the content',
			blocks: [
				block( 'page', 'core/group', {}, [
					templatePart( 'header', 'header' ),
					block( 'main', 'core/group' ),
				] ),
			],
			expected: [
				[ 'header', 's:header', [ 's:logo' ] ],
				[ 'content', 's:main' ],
			],
		},
		{
			case: 'widens the footer as it does the header',
			blocks: [
				block( 'main', 'core/group' ),
				block( 'cover', 'core/cover', {}, [ templatePart( 'footer', 'footer' ) ] ),
			],
			expected: [
				[ 'content', 's:main' ],
				[ 'footer', 's:cover', [ 's:footer', [ 's:credit' ] ] ],
			],
		},
		{
			case: 'lists a part inside the content once, and does not widen it there',
			blocks: [
				block( 'main', 'core/group', {}, [
					templatePart( 'header', 'header' ),
					block( 'wrap', 'core/group', {}, [ templatePart( 'footer', 'footer' ) ] ),
				] ),
			],
			expected: [
				[ 'header', 's:header', [ 's:logo' ] ],
				[ 'content', 's:main', [ 's:wrap', [ 's:footer', [ 's:credit' ] ] ] ],
				[ 'footer', 's:footer', [ 's:credit' ] ],
			],
		},
		{
			case: 'keeps the footer to its part when both share a wrapper',
			blocks: [
				block( 'chrome', 'core/group', {}, [
					templatePart( 'header', 'header' ),
					templatePart( 'footer', 'footer' ),
				] ),
				block( 'main', 'core/group' ),
			],
			expected: [
				[ 'header', 's:chrome', [ 's:header', [ 's:logo' ] ], [ 's:footer', [ 's:credit' ] ] ],
				[ 'content', 's:main' ],
				[ 'footer', 's:footer', [ 's:credit' ] ],
			],
		},
	] )( '$case', ( { blocks, expected } ) => {
		withEditor( {
			blocks,
			controlled: {
				header: [ block( 'logo', 'core/site-logo' ) ],
				footer: [ block( 'credit', 'core/paragraph' ) ],
			},
			sectionRoot: 'main',
		} );

		expect( pageOutline() ).toEqual( expected );
	} );
} );

describe( 'a menu', () => {
	const link = ( clientId: string, label: string, innerBlocks: EditorBlock[] = [] ) =>
		block( clientId, 'core/navigation-link', { label }, innerBlocks );
	const page = ( ref?: number, items: EditorBlock[] = [] ) => ( {
		blocks: [ block( 'nav', 'core/navigation', { ref }, items ) ],
	} );

	// The rendered items are the blocks the editor can address, so they come first.
	it( "lists the items the view renders, and keeps each one's attributes", () => {
		withEditor( page( 9, [ link( 'about', 'About', [ link( 'team', 'Team' ) ] ) ] ) );

		expect( pageOutline() ).toEqual( [ [ 's:nav', [ 's:about', [ 's:team' ] ] ] ] );
		expect( getLoadedMenuItems ).not.toHaveBeenCalled();
		expect( setMenuItemAttributes ).toHaveBeenCalledWith(
			new Map( [
				[ 's:about', { label: 'About' } ],
				[ 's:team', { label: 'Team' } ],
			] )
		);
	} );

	// Its items' clientIds name no block, so what each short id stood for is
	// kept by its attributes too.
	it( 'lists the items of the record of a menu the view does not render', () => {
		withEditor( page( 9 ) );
		jest.mocked( getLoadedMenuItems ).mockReturnValue( [ link( 'about', 'About' ) ] as never );

		expect( pageOutline() ).toEqual( [ [ 's:nav', [ 's:about' ] ] ] );
		expect( getLoadedMenuItems ).toHaveBeenCalledWith( 9 );
		expect( setMenuItemAttributes ).toHaveBeenCalledWith(
			new Map( [ [ 's:about', { label: 'About' } ] ] )
		);
	} );

	it.each( [
		{ case: 'its record has not loaded', ref: 9 },
		{ case: 'it names no record', ref: undefined },
	] )( 'lists an unrendered menu empty while $case', ( { ref } ) => {
		withEditor( page( ref ) );

		expect( pageOutline() ).toEqual( [ [ 's:nav' ] ] );
	} );
} );

it.each( [
	{ case: 'a block the structure lists', selected: 'intro', expected: 's:intro' },
	{ case: 'a block it does not list', selected: 'elsewhere', expected: '' },
] )( 'reports $case as the selection', ( { selected, expected } ) => {
	withEditor( { blocks: [ block( 'intro', 'core/paragraph' ) ], selected } );

	expect( getPageStructure()?.selectedBlockClientId ).toBe( expected );
} );

// An empty structure would displace the provider's while the editor loads.
it( 'is null until the editor holds a post', () => {
	withEditor( { blocks: [ block( 'intro', 'core/paragraph' ) ] } );
	editor.getCurrentPost.mockReturnValue( undefined );

	expect( getPageStructure() ).toBeNull();
	expect( setMenuItemAttributes ).toHaveBeenCalledWith( new Map() );
} );

// A context read must never fail the turn: the context goes out without it.
it( 'is null when the editor cannot be read', () => {
	editor.getSectionRootClientId.mockImplementation( () => {
		throw new Error( 'The block editor store is not registered.' );
	} );

	expect( getPageStructure() ).toBeNull();
	expect( setMenuItemAttributes ).toHaveBeenCalledWith( new Map() );
} );
