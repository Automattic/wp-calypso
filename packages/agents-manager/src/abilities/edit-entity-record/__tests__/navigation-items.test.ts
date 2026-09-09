jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( ( name, attributes ) => ( { name, attributes, innerBlocks: [] } ) ),
	serialize: jest.fn( ( blocks ) => `<!-- ${ blocks.length } items -->` ),
} ) );
jest.mock( '../../../utils/navigation-menu', () => ( {
	NAVIGATION_LINK_BLOCK: 'core/navigation-link',
	NAVIGATION_SUBMENU_BLOCK: 'core/navigation-submenu',
	readMenuItems: jest.fn(),
} ) );

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

/** The labels of the rebuilt menu, in order. */
const labelsOf = ( record: Record< string, unknown > ) =>
	( record.blocks as { attributes: { label: string } }[] ).map(
		( block ) => block.attributes.label
	);

beforeEach( () => jest.clearAllMocks() );

it( 'passes a record without navigationItems straight through', async () => {
	const record = { title: 'Main' };

	await expect( buildNavigationItems( 10, record ) ).resolves.toBe( record );
	expect( readMenuItems ).not.toHaveBeenCalled();
} );

// `content` is the record's persisted form; `blocks` is the editor's view.
it( 'writes both the blocks and the serialized content', async () => {
	withMenu( [ item( 'a', 'Home' ) ] );

	const built = await buildNavigationItems( 10, { navigationItems: [ { clientId: 'a' } ] } );

	expect( built.blocks ).toHaveLength( 1 );
	expect( built.content ).toBe( '<!-- 1 items -->' );
} );

it( 'reorders existing items, keeping the blocks they already are', async () => {
	withMenu( [ item( 'a', 'Home' ), item( 'b', 'About' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { clientId: 'b' }, { clientId: 'a' } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'About', 'Home' ] );
} );

it( 'relabels an item while leaving the rest alone', async () => {
	withMenu( [ item( 'a', 'Home' ), item( 'b', 'About' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { clientId: 'a' }, { clientId: 'b', label: 'About us' } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'Home', 'About us' ] );
} );

it( 'adds an item that matches nothing in the menu', async () => {
	withMenu( [ item( 'a', 'Home' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { clientId: 'a' }, { label: 'Contact', url: '/contact/' } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'Home', 'Contact' ] );
} );

it( 'removes an item by omitting it', async () => {
	withMenu( [ item( 'a', 'Home' ), item( 'b', 'About' ) ] );

	const built = await buildNavigationItems( 10, { navigationItems: [ { clientId: 'a' } ] } );

	expect( labelsOf( built ) ).toEqual( [ 'Home' ] );
} );

it( 'resolves an item moved under a different parent', async () => {
	withMenu( [ item( 'a', 'Company' ), item( 'b', 'About' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { clientId: 'a', items: [ { clientId: 'b' } ] } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'Company' ] );
	expect( ( built.blocks as never[] )[ 0 ] ).toMatchObject( {
		innerBlocks: [ { attributes: { label: 'About' } } ],
	} );
} );

// A clientId is only stable for a menu the editor already edited; a pristine one
// re-parses to fresh ids. The label the agent sent alongside it still resolves.
it( 'reuses the block a stale clientId names by its label instead', async () => {
	withMenu( [ item( 'fresh', 'About' ) ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { clientId: 'gone', label: 'About' } ],
	} );

	expect( labelsOf( result ) ).toEqual( [ 'About' ] );
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

// The schema stops validating below the first level.
it( 'ignores a nested items value that is not an array', async () => {
	withMenu( [ item( 'a', 'About' ) ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'About', items: 'invalid' } ],
	} );

	expect( labelsOf( result ) ).toEqual( [ 'About' ] );
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

// A clientId with no label or url carries nothing to rebuild from. Building a
// blank link over a real item reads to the user as the menu being wiped.
it( 'refuses when a clientId resolves to nothing, naming the ids', async () => {
	withMenu( [ item( 'a', 'Home' ) ] );

	await expect(
		buildNavigationItems( 10, { navigationItems: [ { clientId: 'a' }, { clientId: 'gone' } ] } )
	).rejects.toThrow( 'gone' );
} );

// The item brought its own data, so a stale clientId is bookkeeping, not loss.
it( 'creates an item when a stale clientId matches nothing in the menu', async () => {
	withMenu( [ item( 'a', 'Home' ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { clientId: 'gone', label: 'Contact', url: '/contact/' } ],
	} );

	expect( labelsOf( built ) ).toEqual( [ 'Contact' ] );
} );

it( 'refuses when the menu cannot be read', async () => {
	withMenu( null );

	await expect(
		buildNavigationItems( 10, { navigationItems: [ { label: 'Home' } ] } )
	).rejects.toThrow( 'not found' );
} );
