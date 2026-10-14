jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( ( name, attributes ) => ( { name, attributes, innerBlocks: [] } ) ),
	parse: jest.fn( () => [ { name: 'core/navigation-link', attributes: {}, innerBlocks: [] } ] ),
	serialize: jest.fn( ( blocks ) => `<!-- ${ blocks.length } items -->` ),
} ) );
jest.mock( '../../../utils/block-ids', () => ( {
	getMenuItemAttributes: jest.fn(),
	resolveClientId: jest.fn(),
} ) );
jest.mock( '../../../utils/navigation-menu', () => ( {
	NAVIGATION_LINK_BLOCK: 'core/navigation-link',
	NAVIGATION_SUBMENU_BLOCK: 'core/navigation-submenu',
	readMenuItems: jest.fn(),
} ) );

import { parse } from '@wordpress/blocks';
import { getMenuItemAttributes, resolveClientId } from '../../../utils/block-ids';
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

/** What the page structure kept for the agent's short ids. */
const withPageStructure = ( {
	clientIds = {},
	menuItemAttributes = {},
}: {
	clientIds?: Record< string, string >;
	menuItemAttributes?: Record< string, Record< string, unknown > >;
} ) => {
	( resolveClientId as jest.Mock ).mockImplementation( ( id ) => clientIds[ id ] ?? id );
	( getMenuItemAttributes as jest.Mock ).mockImplementation( ( id ) => menuItemAttributes[ id ] );
};

/** The labels of the rebuilt menu, in order. */
const labelsOf = ( record: Record< string, unknown > ) =>
	( record.blocks as { attributes: { label: string } }[] ).map(
		( block ) => block.attributes.label
	);

/** The clientIds of the rebuilt menu, in order; a newly built item has none. */
const clientIdsOf = ( record: Record< string, unknown > ) =>
	( record.blocks as { clientId?: string }[] ).map( ( block ) => block.clientId );

const attributesOf = ( record: Record< string, unknown >, index = 0 ) =>
	( record.blocks as { attributes: Record< string, unknown > }[] )[ index ].attributes;

beforeEach( () => {
	jest.clearAllMocks();
	withPageStructure( {} );
	withMenu( null );
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

	expect( clientIdsOf( built ) ).toEqual( [ 'b', 'a' ] );
} );

it( 'relabels an item while leaving the rest alone', async () => {
	withMenu( [ item( 'a', 'Home' ), item( 'b', 'About', { id: 7 } ) ] );

	const built = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'Home' }, { id: 7, label: 'About us' } ],
	} );

	expect( clientIdsOf( built ) ).toEqual( [ 'a', 'b' ] );
	expect( labelsOf( built ) ).toEqual( [ 'Home', 'About us' ] );
} );

// The rename path compares labels the same way, so one rule serves both.
it( 'claims an item by its label in another case, with spare whitespace', async () => {
	withMenu( [ item( 'a', 'About Us' ) ] );

	const built = await buildNavigationItems( 10, { navigationItems: [ { label: ' about us ' } ] } );

	expect( clientIdsOf( built ) ).toEqual( [ 'a' ] );
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

	// Gaining a child is what makes the link a submenu.
	expect( built.blocks ).toMatchObject( [
		{ clientId: 'a', name: SUBMENU, innerBlocks: [ { clientId: 'b' } ] },
	] );
} );

// The page structure carries short block ids, which `utils/block-ids.ts`
// resolves back to the editor's clientIds; the editor's own ids, which
// `get-block-tree` reports, work directly.
describe( 'clientId', () => {
	beforeEach( () => withMenu( [ item( 'about', 'About' ), item( 'svc', 'Services' ) ] ) );

	/** A short id whose clientId is gone, and what the structure recorded for it. */
	const staleShortId = {
		clientIds: { bMnU: 'gone' },
		menuItemAttributes: { bMnU: { label: 'Services' } },
	};

	it( 'resolves a short id through the id map', async () => {
		withPageStructure( { clientIds: { bMnU: 'svc' } } );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'bMnU' }, { label: 'About' } ],
		} );

		expect( labelsOf( result ) ).toEqual( [ 'Services', 'About' ] );
	} );

	// The structure held for the turn is what named the ids, so a re-read returns
	// them again: the refusal sends the retry to the menu's labels instead.
	it( 'steers a short id that names nothing to the labels, not to a re-read', async () => {
		withPageStructure( { clientIds: { bMnU: 'gone' } } );

		await expect(
			buildNavigationItems( 10, { navigationItems: [ { clientId: 'bMnU' } ] } )
		).rejects.toThrow(
			'Navigation items not found: bMnU. Do not re-read the page structure; its ids are stale. ' +
				'Send each existing item by its label instead — this menu holds "About", "Services".'
		);
	} );

	// The editor re-creates a menu's blocks when the record reloads, so the
	// clientId a short id mapped to can be gone; what the structure recorded
	// for the item still names it.
	it( 'still finds an item the request relabels and re-links', async () => {
		withPageStructure( staleShortId );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'bMnU', label: 'Our services', url: '/our-services/' } ],
		} );

		expect( clientIdsOf( result ) ).toEqual( [ 'svc' ] );
		expect( labelsOf( result ) ).toEqual( [ 'Our services' ] );
	} );

	// A re-link's new page id must not claim the item already pointing at that
	// page: what the structure recorded for the short id names the block.
	it( 'prefers what the structure recorded over a re-linked page id', async () => {
		withMenu( [ item( 'svc', 'Services', { id: 5 } ), item( 'team', 'Team', { id: 9 } ) ] );
		withPageStructure( staleShortId );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'bMnU', id: 9, url: '/team/' }, { label: 'Team' } ],
		} );

		expect( clientIdsOf( result ) ).toEqual( [ 'svc', 'team' ] );
	} );

	// A clientId names an existing item; one that resolves to nothing must not
	// be rebuilt from the label, dropping the block it meant.
	it( 'refuses a clientId that resolves to nothing, even with a label', async () => {
		await expect(
			buildNavigationItems( 10, { navigationItems: [ { clientId: 'gone', label: 'New' } ] } )
		).rejects.toThrow( 'Navigation items not found: gone' );
	} );

	// The label names the other item, so the ranking decides; it then relabels.
	it( 'accepts the editor clientId itself, over a label sent with it', async () => {
		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'svc', label: 'About' } ],
		} );

		expect( clientIdsOf( result ) ).toEqual( [ 'svc' ] );
		expect( labelsOf( result ) ).toEqual( [ 'About' ] );
	} );
} );

// An item can also be named by the page or the url it links to, and sending a
// new one re-links it.
describe( 'page and url links', () => {
	beforeEach( () => withMenu( [ item( 'about', 'About' ), item( 'svc', 'Services' ) ] ) );

	it( 'claims an item by its url written differently', async () => {
		withMenu( [ item( 'about', 'About', { url: 'http://localhost/about/' } ) ] );

		const result = await buildNavigationItems( 10, { navigationItems: [ { url: '/about' } ] } );

		expect( clientIdsOf( result ) ).toEqual( [ 'about' ] );
	} );

	// Two anchor links into one page are two items: the fragment tells them
	// apart, where a page's own link is the same page with or without one.
	it( 'claims anchor links into one page apart', async () => {
		withMenu( [
			item( 'team', 'Team', { url: '/about/#team' } ),
			item( 'contact', 'Contact', { url: '/about/#contact' } ),
		] );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { url: '/about/#contact' }, { url: '/about/#team' } ],
		} );

		expect( clientIdsOf( result ) ).toEqual( [ 'contact', 'team' ] );
	} );

	// A url alone names an existing item; a new one needs a label, or a stale
	// url would drop the item it meant and insert a link with no text.
	it( 'refuses a url that names no item and comes with no label', async () => {
		await expect(
			buildNavigationItems( 10, { navigationItems: [ { url: '/nowhere/' } ] } )
		).rejects.toThrow( 'Navigation items not found: /nowhere/' );
	} );

	// A category can carry the same number as a page, and a bare id means a page.
	it( 'does not let a page id claim a taxonomy link', async () => {
		withMenu( [ item( 'a', 'News', { id: 5, type: 'category' } ) ] );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { label: 'News' }, { id: 5, label: 'Page five', url: '/page-five/' } ],
		} );

		// The category link stays News; the page link is built beside it.
		expect( clientIdsOf( result ) ).toEqual( [ 'a', undefined ] );
	} );

	// `core/navigation-link` supplies no default `type` or `kind`, and without
	// them WordPress does not treat the item as the page's.
	it( 'gives a new item with a page id the page relationship, as a number', async () => {
		const result = await buildNavigationItems( 10, {
			navigationItems: [ { label: 'Services' }, { id: '7', label: 'About', url: '/about/' } ],
		} );

		expect( attributesOf( result, 1 ) ).toMatchObject( {
			id: 7,
			type: 'page',
			kind: 'post-type',
			url: '/about/',
		} );
	} );

	// Like a page id, a url alone classifies a new item — as the custom link the
	// editor's link control would make of it.
	it( 'makes a custom link of a new item with a url alone', async () => {
		const result = await buildNavigationItems( 10, {
			navigationItems: [
				{ label: 'Services' },
				{ label: 'Blog', url: 'https://blog.example.com/' },
			],
		} );

		expect( attributesOf( result, 1 ) ).toMatchObject( {
			url: 'https://blog.example.com/',
			type: 'custom',
			kind: 'custom',
		} );
	} );

	// The block renders its href from `url`: a page link without one has no
	// destination, or keeps the previous page's.
	it( 'refuses a page link without its url', async () => {
		await expect(
			buildNavigationItems( 10, { navigationItems: [ { id: 7, label: 'About' } ] } )
		).rejects.toThrow( 'needs its url' );
	} );

	// A new page id makes a page link whatever the block linked before — a
	// category link would otherwise keep declaring a category with a page id.
	it.each( [
		{ id: 7, type: 'page', kind: 'post-type', url: '/about/' },
		// A category can carry the same number as the page.
		{ id: 9, type: 'category', kind: 'taxonomy', url: '/category/team/' },
	] )( 'makes a page link of an item re-linked to another page from %o', async ( from ) => {
		withMenu( [ item( 'about', 'About', from ) ] );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'about', id: 9, url: '/team/' } ],
		} );

		expect( attributesOf( result ) ).toMatchObject( {
			id: 9,
			url: '/team/',
			type: 'page',
			kind: 'post-type',
		} );
	} );

	// The page it pointed at must not follow a re-linked item into renames and
	// deletions — whether the item was identified by clientId or by that page id.
	it.each( [ { clientId: 'about' }, { id: 7 } ] )(
		'drops the page relationship from an item re-linked elsewhere by %o',
		async ( identity ) => {
			withMenu( [
				item( 'about', 'About', { id: 7, type: 'page', kind: 'post-type', url: '/about/' } ),
			] );

			const result = await buildNavigationItems( 10, {
				navigationItems: [ { ...identity, url: 'https://elsewhere.com/' } ],
			} );

			expect( attributesOf( result ) ).toEqual( {
				label: 'About',
				url: 'https://elsewhere.com/',
				type: 'custom',
				kind: 'custom',
			} );
		}
	);

	it( 'keeps the page relationship when the url is the same one written differently', async () => {
		withMenu( [
			item( 'about', 'About', { id: 7, type: 'page', kind: 'post-type', url: '/about/' } ),
		] );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { clientId: 'about', url: 'http://localhost/about' } ],
		} );

		expect( attributesOf( result ) ).toMatchObject( { id: 7, type: 'page', kind: 'post-type' } );
	} );
} );

describe( 'input validation', () => {
	it( 'refuses navigationItems that is not an array', async () => {
		await expect( buildNavigationItems( 10, { navigationItems: 'Home' } ) ).rejects.toThrow(
			'must be an array of menu items'
		);
	} );

	it.each( [
		{ case: 'a top-level entry that is not an object', items: [ null ] },
		{ case: 'a clientId that is not a string', items: [ { clientId: 7 } ] },
		{ case: 'an entry that names no item', items: [ { opensInNewTab: true } ] },
		{ case: 'a blank label', items: [ { label: '  ' } ] },
		{ case: 'a zero id', items: [ { id: 0 } ] },
		{ case: 'an id that is not a number or string', items: [ { id: { page: 7 } } ] },
		{ case: 'an id that is not a positive integer', items: [ { id: 'abc' } ] },
		{ case: 'items that is not an array', items: [ { label: 'A', items: 'B' } ] },
	] )( 'refuses $case', async ( { items } ) => {
		await expect( buildNavigationItems( 10, { navigationItems: items } ) ).rejects.toThrow(
			'Invalid navigation items'
		);
	} );

	it( 'ignores keys it does not read, and takes null as absent', async () => {
		withMenu( [ item( 'a', 'Home' ) ] );

		const result = await buildNavigationItems( 10, {
			navigationItems: [ { label: 'Home', url: null, items: null, rel: 'nofollow', ref: 10 } ],
		} );

		expect( clientIdsOf( result ) ).toEqual( [ 'a' ] );
	} );

	it( 'names the entry and the field it refuses', async () => {
		await expect(
			buildNavigationItems( 10, { navigationItems: [ { label: 'Home' }, { label: 7 } ] } )
		).rejects.toThrow( 'entry 2 has a label that is not a non-empty string' );
	} );

	// Dropping the entry instead would replace Home's children with an empty list,
	// clearing a submenu the request never asked to touch.
	it( 'refuses a malformed nested item', async () => {
		await expect(
			buildNavigationItems( 10, { navigationItems: [ { label: 'Home', items: [ null ] } ] } )
		).rejects.toThrow( 'Invalid navigation items under "Home"' );
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

		expect( parse ).toHaveBeenCalledWith( '<!-- wp:navigation-link /-->' );
		expect( built.blocks ).toHaveLength( 1 );
	} );

	// Anything but serialized blocks would persist while the editor kept its own.
	it.each( [ null, 7 ] )( 'refuses content that is not a string: %p', async ( content ) => {
		await expect( buildNavigationItems( 10, { content } ) ).rejects.toThrow(
			'content must be a string'
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

	const blocks = result.blocks as { name: string; innerBlocks: unknown[] }[];

	expect( clientIdsOf( result ) ).toEqual( [ 'about', 'svc' ] );
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

	expect( clientIdsOf( result ) ).toEqual( [ 'b', 'a' ] );
} );

// Labels claim last, so a label match cannot take the block an id names.
it( 'lets an id claim its block before a label takes it', async () => {
	withMenu( [ item( 'a', 'Contact', { id: 5 } ), item( 'b', 'Contact', { id: 6 } ) ] );

	const result = await buildNavigationItems( 10, {
		navigationItems: [ { label: 'Contact' }, { id: 5 } ],
	} );

	expect( clientIdsOf( result ) ).toEqual( [ 'b', 'a' ] );
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

	expect( clientIdsOf( result ) ).toEqual( [ 'a', 'b' ] );
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

it( 'refuses when the menu cannot be read', async () => {
	withMenu( null );

	await expect(
		buildNavigationItems( 10, { navigationItems: [ { label: 'Home' } ] } )
	).rejects.toThrow( 'Navigation menu not found: 10' );
} );
