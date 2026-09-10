jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( ( name, attributes ) => ( { name, attributes, innerBlocks: [] } ) ),
	parse: jest.fn( () => [ { name: 'core/navigation-link', attributes: {}, innerBlocks: [] } ] ),
	serialize: jest.fn( ( blocks ) => `<!-- ${ blocks.length } items -->` ),
} ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );
jest.mock( '../../../utils/navigation-menu', () => ( {
	NAVIGATION_LINK_BLOCK: 'core/navigation-link',
	NAVIGATION_SUBMENU_BLOCK: 'core/navigation-submenu',
	readMenuItems: jest.fn(),
} ) );

import { select } from '@wordpress/data';
import { readMenuItems } from '../../../utils/navigation-menu';
import { buildNavigationItems } from '../navigation-items';

const item = (
	clientId: string,
	label: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: unknown[] = []
) => ( {
	name: 'core/navigation-link',
	clientId,
	attributes: { label, ...attributes },
	innerBlocks,
} );

const SUBMENU = 'core/navigation-submenu';

const withMenu = ( items: unknown[] | null ) =>
	( readMenuItems as jest.Mock ).mockResolvedValue( items );

/** The short-id map Big Sky's page structure leaves in its store. */
const withShortIds = ( clientIdMap: Record< string, string > ) =>
	( select as jest.Mock ).mockReturnValue( { getFullPageStructure: () => ( { clientIdMap } ) } );

/** The labels of the rebuilt menu, in order. */
const labelsOf = ( record: Record< string, unknown > ) =>
	( record.blocks as { attributes: { label: string } }[] ).map(
		( block ) => block.attributes.label
	);

beforeEach( () => {
	jest.clearAllMocks();
	( select as jest.Mock ).mockReturnValue( undefined );
} );

it( 'passes a record without navigationItems straight through', async () => {
	const record = { title: 'Main' };

	await expect( buildNavigationItems( 10, record ) ).resolves.toBe( record );
	expect( readMenuItems ).not.toHaveBeenCalled();
} );

// `content` is the record's persisted form; `blocks` is the editor's view.
it( 'writes both the blocks and the serialized content', async () => {
	withMenu( [ item( 'a', 'Home' ) ] );

	const built = await buildNavigationItems( 10, { navigationItems: [ { label: 'Home' } ] } );

	expect( built.blocks ).toHaveLength( 1 );
	expect( built.content ).toBe( '<!-- 1 items -->' );
} );

it( 'reorders existing items, keeping the blocks they already are', async () => {
	withMenu( [ item( 'a', 'Home' ), item( 'b', 'About' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'About' }, { label: 'Home' } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'About', 'Home' ] );
} );

it( 'relabels an item while leaving the rest alone', async () => {
	withMenu( [ item( 'a', 'Home' ), item( 'b', 'About', { id: 7 } ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'Home' }, { id: 7, label: 'About us' } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'Home', 'About us' ] );
} );

it( 'adds an item that matches nothing in the menu', async () => {
	withMenu( [ item( 'a', 'Home' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'Home' }, { label: 'Contact', url: '/contact/' } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'Home', 'Contact' ] );
} );

it( 'removes an item by omitting it', async () => {
	withMenu( [ item( 'a', 'Home' ), item( 'b', 'About' ) ] );

	const built = await buildNavigationItems( 10, { navigationItems: [ { label: 'Home' } ] } );

	expect( labelsOf( built ) ).toEqual( [ 'Home' ] );
} );

it( 'resolves an item moved under a different parent', async () => {
	withMenu( [ item( 'a', 'Company' ), item( 'b', 'About' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'Company', items: [ { label: 'About' } ] } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'Company' ] );
	expect( ( built.blocks as never[] )[ 0 ] ).toMatchObject( {
		innerBlocks: [ { attributes: { label: 'About' } } ],
	} );
} );

// The page structure Big Sky sends the agent carries short block ids, with the
// map back to the editor's clientIds in its store; the editor's own ids, which
// `get-block-tree` reports, work directly.
describe( 'clientId', () => {
	beforeEach( () => withMenu( [ item( 'about', 'About' ), item( 'svc', 'Services' ) ] ) );

	it( 'resolves a short id through the provider map', async () => {
		withShortIds( { bMnU: 'svc' } );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'bMnU' }, { label: 'About' } ],
		} );

		expect( labelsOf( result ) ).toEqual( [ 'Services', 'About' ] );
	} );

	it( 'accepts the editor clientId itself', async () => {
		const result = await buildNavigationItems( 10, { navigationItems: [ { clientId: 'svc' } ] } );

		expect( labelsOf( result ) ).toEqual( [ 'Services' ] );
	} );

	it( 'outranks a label sent with it, which then relabels the item', async () => {
		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'svc', label: 'Our services' } ],
		} );

		expect( ( result.blocks as { clientId: string }[] ).map( ( b ) => b.clientId ) ).toEqual( [
			'svc',
		] );
		expect( labelsOf( result ) ).toEqual( [ 'Our services' ] );
	} );

	// Directive, and self-sufficient: the retry needs no further reading.
	it( 'refuses an unknown clientId and names the menu items', async () => {
		const rebuild = buildNavigationItems( 10, { navigationItems: [ { clientId: 'gone' } ] } );

		await expect( rebuild ).rejects.toThrow( 'Navigation items not found: gone' );
		await expect( rebuild ).rejects.toThrow( 'this menu holds "About", "Services"' );
	} );
} );

// A category can carry the same number as a page, and a bare id means a page.
it( 'does not let a page id claim a taxonomy link', async () => {
	withMenu( [ item( 'a', 'News', { id: 5, type: 'category' } ) ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'News' }, { id: 5, label: 'Page five' } ],
	} );

	expect( labelsOf( result ) ).toEqual( [ 'News', 'Page five' ] );
} );

describe( 'input validation', () => {
	it( 'refuses navigationItems that is not an array', async () => {
		withMenu( [ item( 'a', 'Home' ) ] );

		await expect( buildNavigationItems( 10, { navigationItems: 'Home' } ) ).rejects.toThrow(
			'navigationItems must be an array'
		);
	} );

	it.each( [
		{ case: 'a top-level entry that is not an object', items: [ null ] },
		{ case: 'a nested entry that is not an object', items: [ { label: 'A', items: [ null ] } ] },
		{ case: 'a clientId that is not a string', items: [ { clientId: 7 } ] },
		{ case: 'a label that is not a string', items: [ { label: 123 } ] },
		{ case: 'an empty label', items: [ { label: '' } ] },
		{ case: 'a zero id', items: [ { id: 0 } ] },
		{ case: 'an id that is not a number or string', items: [ { id: { page: 7 } } ] },
		{ case: 'items that is not an array', items: [ { label: 'A', items: 'B' } ] },
	] )( 'refuses $case', async ( { items } ) => {
		withMenu( [ item( 'a', 'Home' ) ] );

		await expect( buildNavigationItems( 10, { navigationItems: items } ) ).rejects.toThrow(
			'Invalid navigation items'
		);
	} );

	it( 'refuses raw blocks that are not an array', async () => {
		await expect( buildNavigationItems( 10, { blocks: 'Home' } ) ).rejects.toThrow(
			'blocks must be an array'
		);
	} );
} );

// `content` is what persists and `blocks` what the editor reads; a raw edit
// carrying one half is completed so neither goes stale.
describe( 'raw menu edits', () => {
	it( 'serializes content from raw blocks', async () => {
		const built = await buildNavigationItems( 10, {
			blocks: [ item( 'a', 'Home' ) ],
			title: 'Main',
		} );

		expect( built ).toMatchObject( { content: '<!-- 1 items -->', title: 'Main' } );
	} );

	it( 'parses blocks from raw content', async () => {
		const built = await buildNavigationItems( 10, { content: '<!-- wp:navigation-link /-->' } );

		expect( built.blocks ).toHaveLength( 1 );
	} );

	// The schema allows a null `content` for other records; on a menu it would
	// persist nothing while the editor kept its blocks.
	it( 'refuses null content', async () => {
		await expect( buildNavigationItems( 10, { content: null } ) ).rejects.toThrow(
			'content cannot be null'
		);
	} );
} );

// Listing a child at the top level moves it: keeping it nested *and* placing it
// would put one block in the menu twice. Big Sky copies it instead.
it( 'moves an item listed at the top level out of its submenu', async () => {
	withMenu( [ { ...item( 'about', 'About', {}, [ item( 'svc', 'Services' ) ] ), name: SUBMENU } ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'About' }, { label: 'Services' } ],
	} );

	const blocks = result.blocks as { clientId: string; name: string; innerBlocks: unknown[] }[];

	expect( blocks.map( ( b ) => b.clientId ) ).toEqual( [ 'about', 'svc' ] );
	expect( blocks[ 0 ].innerBlocks ).toEqual( [] );
	// Nothing left to open, so it must not still draw a dropdown arrow.
	expect( blocks[ 0 ].name ).toBe( 'core/navigation-link' );
} );

// Omitting `items` leaves a parent's children alone — the agent relabelling a
// parent must not silently drop its submenu.
it( 'keeps children the input does not mention', async () => {
	withMenu( [ { ...item( 'about', 'About', {}, [ item( 'svc', 'Services' ) ] ), name: SUBMENU } ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'About', url: '/about-us/' } ],
	} );

	const blocks = result.blocks as { name: string; innerBlocks: { clientId: string }[] }[];

	expect( blocks[ 0 ].innerBlocks.map( ( b ) => b.clientId ) ).toEqual( [ 'svc' ] );
	expect( blocks[ 0 ].name ).toBe( SUBMENU );
} );

// Preserving a submenu's children must not retype the other blocks a menu holds.
it( 'keeps the type of preserved blocks that are not menu links', async () => {
	withMenu( [
		{
			...item( 'about', 'About', {}, [ { ...item( 'pl', '' ), name: 'core/page-list' } ] ),
			name: SUBMENU,
		},
	] );

	const result = await buildNavigationItems( 10, { navigationItems: [ { label: 'About' } ] } );
	const blocks = result.blocks as { innerBlocks: { name: string }[] }[];

	expect( blocks[ 0 ].innerBlocks[ 0 ].name ).toBe( 'core/page-list' );
} );

// Urls are no more unique than labels, so they claim after ids do.
it( 'lets an id claim its block before a shared url takes it', async () => {
	withMenu( [
		item( 'a', 'Contact', { id: 5, url: '/contact/' } ),
		item( 'b', 'Contact us', { id: 6, url: '/contact/' } ),
	] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { url: '/contact/' }, { id: 5 } ],
	} );

	const clientIds = ( result.blocks as { clientId: string }[] ).map( ( b ) => b.clientId );

	expect( clientIds ).toEqual( [ 'b', 'a' ] );
} );

// Labels claim last, so a label match cannot take the block an id names.
it( 'lets an id claim its block before a label takes it', async () => {
	withMenu( [ item( 'a', 'Contact', { id: 5 } ), item( 'b', 'Contact', { id: 6 } ) ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'Contact' }, { id: 5 } ],
	} );

	const clientIds = ( result.blocks as { clientId: string }[] ).map( ( b ) => b.clientId );

	expect( clientIds ).toEqual( [ 'b', 'a' ] );
} );

// A > B > C: moving C to the top level must lift it out of B as well, or the
// same block sits in the menu twice under different parents.
it( 'lifts an item out of a submenu nested more than one level deep', async () => {
	withMenu( [
		{
			...item( 'a', 'A', {}, [ { ...item( 'b', 'B', {}, [ item( 'c', 'C' ) ] ), name: SUBMENU } ] ),
			name: SUBMENU,
		},
	] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'A' }, { label: 'C' } ],
	} );

	expect( JSON.stringify( result.blocks ).match( /"clientId":"c"/g ) ).toHaveLength( 1 );
	// B lost its only child, so it must not still draw a dropdown arrow.
	const a = ( result.blocks as { innerBlocks: { name: string }[] }[] )[ 0 ];
	expect( a.innerBlocks[ 0 ].name ).toBe( 'core/navigation-link' );
} );

// Labels are not unique. Resolving both inputs to the same block would emit it
// twice, and two menu items cannot share a clientId.
it( 'gives two items sharing a label the two blocks that share it', async () => {
	withMenu( [ item( 'a', 'Contact' ), item( 'b', 'Contact' ) ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'Contact' }, { label: 'Contact' } ],
	} );

	const clientIds = ( result.blocks as { clientId: string }[] ).map( ( b ) => b.clientId );

	expect( clientIds ).toEqual( [ 'a', 'b' ] );
} );

// Only one block carries id 5, so the second input has nothing left to claim
// and nothing of its own to build from. Checking resolution separately from
// building would have let this through as a blank link.
it( 'refuses a second item claiming an id only one block carries', async () => {
	withMenu( [ item( 'a', 'Contact', { id: 5 } ) ] );

	await expect(
		buildNavigationItems( 10, { navigationItems: [ { id: 5 }, { id: 5 } ] } )
	).rejects.toThrow( 'Navigation items not found: 5' );
} );

// An id that resolves to nothing builds a link with no text — the same wipe a
// stale clientId would cause, reachable without one.
it( 'refuses an id that resolves to nothing and carries no label', async () => {
	withMenu( [ item( 'a', 'About', { id: 5 } ) ] );

	await expect( buildNavigationItems( 10, { navigationItems: [ { id: 999 } ] } ) ).rejects.toThrow(
		'Navigation items not found: 999'
	);
} );

// An id with no label or url carries nothing to rebuild from. Building a
// blank link over a real item reads to the user as the menu being wiped.
it( 'refuses when an id resolves to nothing, naming it', async () => {
	withMenu( [ item( 'a', 'Home' ) ] );

	await expect(
		buildNavigationItems( 10, { navigationItems: [ { label: 'Home' }, { id: 42 } ] } )
	).rejects.toThrow( 'Navigation items not found: 42' );
} );

// Dropping the entry instead would replace Home's children with an empty list,
// clearing a submenu the request never asked to touch.
it( 'refuses a malformed nested item', async () => {
	withMenu( [ item( 'a1', 'Home' ) ] );

	await expect(
		buildNavigationItems( 10, { navigationItems: [ { label: 'Home', items: [ null ] } ] } )
	).rejects.toThrow( 'Invalid navigation items under "Home"' );
} );

it( 'refuses when the menu cannot be read', async () => {
	withMenu( null );

	await expect(
		buildNavigationItems( 10, { navigationItems: [ { label: 'Home' } ] } )
	).rejects.toThrow( 'not found' );
} );
