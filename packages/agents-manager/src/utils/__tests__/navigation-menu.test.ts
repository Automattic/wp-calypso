jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	dispatch: jest.fn(),
	resolveSelect: jest.fn(),
} ) );
jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( ( name, attributes ) => ( { name, attributes, innerBlocks: [] } ) ),
	parse: jest.fn( () => [] ),
	serialize: jest.fn( () => '<serialized />' ),
} ) );
jest.mock( '../site-metadata', () => ( { getSiteMetadata: jest.fn( () => ( {} ) ) } ) );

import { parse } from '@wordpress/blocks';
import { dispatch, resolveSelect, select } from '@wordpress/data';
import {
	addNavigationItem,
	getMenuIdsToRelabel,
	prefetchMenus,
	removeNavigationItem,
	renameNavigationItem,
} from '../navigation-menu';
import { getSiteMetadata } from '../site-metadata';

const editEntityRecord = jest.fn();
const saveSpecifiedEntityEdits = jest.fn();

const link = (
	id: number | string | undefined,
	label: string,
	innerBlocks: unknown[] = [],
	attributes: Record< string, unknown > = {}
) => ( {
	name: 'core/navigation-link',
	attributes: { id, label, ...attributes },
	innerBlocks,
} );

/**
 * Serves `menus` by id — every one of them is a saved record — and reports
 * which of them the editor renders.
 */
function withMenus(
	menus: Record< string, unknown[] >,
	rendered = Object.keys( menus ),
	{ unsaved = [] as string[] } = {}
) {
	( select as jest.Mock ).mockReturnValue( {
		getBlocksByName: () => rendered.map( ( id ) => `client-${ id }` ),
		getBlock: ( clientId: string ) => ( {
			attributes: { ref: Number( clientId.replace( 'client-', '' ) ) },
		} ),
		hasEditsForEntityRecord: ( _kind: string, _name: string, id: number ) =>
			unsaved.includes( String( id ) ),
	} );
	( resolveSelect as jest.Mock ).mockReturnValue( {
		getEditedEntityRecord: ( _kind: string, _name: string, id: number ) =>
			Promise.resolve( menus[ String( id ) ] ? { id, blocks: menus[ String( id ) ] } : null ),
		getEntityRecords: () =>
			Promise.resolve( Object.keys( menus ).map( ( id ) => ( { id: Number( id ) } ) ) ),
	} );
	( dispatch as jest.Mock ).mockReturnValue( {
		editEntityRecord,
		__experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits,
	} );
}

/** The scoped save: the item fields only, so a pending title edit stays the user's. */
const expectItemsSaved = ( menuId: number ) =>
	expect( saveSpecifiedEntityEdits ).toHaveBeenCalledWith(
		'postType',
		'wp_navigation',
		menuId,
		[ 'blocks', 'content' ],
		{ throwOnError: true }
	);

/** The items the last write sent, the menu it wrote to, and its options. */
const lastWrite = () => {
	const call = editEntityRecord.mock.calls.at( -1 );
	return { menuId: call[ 2 ], items: call[ 3 ].blocks, options: call[ 4 ] };
};

beforeEach( () => {
	jest.clearAllMocks();
	( getSiteMetadata as jest.Mock ).mockReturnValue( {} );
	saveSpecifiedEntityEdits.mockReset();
} );

describe( 'addNavigationItem', () => {
	// The site names no menu here, so the rendered one takes the page.
	it( 'appends the new page to the menu', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ] } );

		await addNavigationItem( { label: 'About', id: 7, url: '/about/' } );

		expect( lastWrite().items ).toHaveLength( 2 );
		expect( lastWrite().items[ 1 ].attributes ).toMatchObject( { label: 'About', id: 7 } );
		// The page itself is already saved, so an unsaved menu item would vanish
		// on the next reload and leave the new page unlinked.
		expectItemsSaved( 10 );
	} );

	// The rendered list holds header and footer alike, so its first entry is
	// not necessarily the menu a new page belongs in.
	it( 'adds to the site menu rather than the first rendered one', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 1, 'Footer' ) ], 99: [ link( 1, 'Home' ) ] }, [ '10' ] );

		await addNavigationItem( { label: 'About', id: 7 } );

		expect( lastWrite().menuId ).toBe( 99 );
	} );

	// An unread site record would look like a site naming no menu, and the page
	// would land in the first rendered one — the footer, say.
	it( 'refuses when the site settings cannot be read', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( undefined );
		withMenus( { 10: [ link( 1, 'Home' ) ] } );

		await expect( addNavigationItem( { label: 'About', id: 7 } ) ).rejects.toThrow(
			'site settings could not be read'
		);
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	const pageList = ( parentPageID?: number ) => ( {
		name: 'core/page-list',
		attributes: { parentPageID },
		innerBlocks: [],
	} );

	// A Page List shows every published page on its own, or a parent's children;
	// a link beside it would show the new page twice.
	it.each( [
		{
			case: 'skips a menu whose Page List lists every page, however nested',
			items: [ link( 1, 'Home', [ pageList() ] ) ],
			parent: undefined,
			writes: 0,
		},
		{
			case: 'skips a menu whose Page List lists the children of its parent',
			items: [ pageList( 3 ) ],
			parent: 3,
			writes: 0,
		},
		{
			case: 'adds beside a Page List scoped to another parent',
			items: [ pageList( 3 ) ],
			parent: undefined,
			writes: 1,
		},
	] )( '$case', async ( { items, parent, writes } ) => {
		withMenus( { 10: items } );

		await addNavigationItem( { label: 'About', id: 7, parent } );

		expect( editEntityRecord ).toHaveBeenCalledTimes( writes );
	} );

	// The user's unsaved edits are theirs to save; the item waits with them.
	it( 'leaves a menu with unsaved edits unsaved, and says which', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ] }, undefined, { unsaved: [ '10' ] } );

		expect( await addNavigationItem( { label: 'About', id: 7 } ) ).toEqual( [ 10 ] );
		expect( lastWrite().items ).toHaveLength( 2 );
		expect( saveSpecifiedEntityEdits ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when the site has no menu', async () => {
		withMenus( {}, [] );

		await addNavigationItem( { label: 'About', id: 7 } );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// A silent return would call the page created and its item never added.
	it( 'refuses when the menu the site names cannot be read', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 1, 'Home' ) ] }, [ '10' ] );

		await expect( addNavigationItem( { label: 'About', id: 7 } ) ).rejects.toThrow(
			'Navigation menu not found: 99'
		);
	} );

	// A save that silently never ran would report a menu change the next
	// reload throws away.
	it( 'refuses when the save action is unavailable, and puts the menu back', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ] } );
		( dispatch as jest.Mock ).mockReturnValue( { editEntityRecord } );

		await expect( addNavigationItem( { label: 'About', id: 7 } ) ).rejects.toThrow(
			'unavailable to save'
		);
		expect( lastWrite() ).toMatchObject( { menuId: 10, items: [ link( 1, 'Home' ) ] } );
	} );
} );

describe( 'renameNavigationItem', () => {
	it( 'relabels the item pointing at the page', async () => {
		withMenus( { 10: [ link( 1, 'Home' ), link( 7, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us' );

		expect( lastWrite().items[ 1 ].attributes.label ).toBe( 'About us' );
		// Out of the editor's undo stack: `restore-checkpoint` is the undo.
		expect( lastWrite().options ).toEqual( { undoIgnore: true } );
	} );

	// After a reload a menu carries only its serialized `content`.
	it( 'reads a menu the editor has not touched from its content', async () => {
		withMenus( { 10: [] } );
		const resolvers = ( resolveSelect as jest.Mock )();
		( resolveSelect as jest.Mock ).mockReturnValue( {
			...resolvers,
			getEditedEntityRecord: () =>
				Promise.resolve( { id: 10, content: '<!-- wp:navigation-link {"id":7} /-->' } ),
		} );
		( parse as jest.Mock ).mockReturnValueOnce( [ link( 7, 'About' ) ] );

		await renameNavigationItem( 7, 'About us' );

		expect( parse ).toHaveBeenCalledWith( '<!-- wp:navigation-link {"id":7} /-->' );
		expect( lastWrite().items[ 0 ].attributes.label ).toBe( 'About us' );
	} );

	it( 'writes only the menus that hold the page', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ], 20: [ link( 7, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us' );

		expect( editEntityRecord ).toHaveBeenCalledTimes( 1 );
		expect( lastWrite().menuId ).toBe( 20 );
	} );

	// A page linked from several menus has to be renamed in all of them, or one
	// keeps the old label: the rendered ones first, then the one the site names,
	// then the rest — a menu off screen still holds its links.
	it( 'reaches every menu holding the page: rendered, named by the site, then the rest', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus(
			{ 10: [ link( 7, 'About' ) ], 50: [ link( 7, 'About' ) ], 99: [ link( 7, 'About' ) ] },
			[ '50' ]
		);

		await renameNavigationItem( 7, 'About us' );

		expect( editEntityRecord.mock.calls.map( ( call ) => call[ 2 ] ) ).toEqual( [ 50, 99, 10 ] );
	} );

	// An idless item is matched by its url, and relabelled only while its label
	// still follows the page — one the user changed by hand is theirs to keep.
	it( 'relabels an idless item found by its url', async () => {
		withMenus( { 10: [ link( undefined, 'About', [], { url: '/about/' } ) ] } );

		await renameNavigationItem( 7, 'About us', [ 'About' ], 'http://localhost/about/' );

		expect( lastWrite().items[ 0 ].attributes.label ).toBe( 'About us' );
	} );

	it( 'leaves an idless item alone when its label no longer follows the page', async () => {
		withMenus( { 10: [ link( undefined, 'Our story', [], { url: '/about/' } ) ] } );

		await renameNavigationItem( 7, 'About us', [ 'About' ], 'http://localhost/about/' );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// An unlinked submenu can share the page's name; a label alone names nothing.
	it( 'leaves an unlinked item that shares the label alone', async () => {
		withMenus( { 10: [ link( undefined, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us', [ 'About' ], 'http://localhost/about/' );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// An empty previous title is a title, not an unknown one: the item's label
	// does not follow it, so it is the user's, and matching by id must not make
	// a page rename overwrite it.
	it( 'leaves a custom label alone when the page was untitled', async () => {
		withMenus( { 10: [ link( 7, 'Learn more' ) ] } );

		await renameNavigationItem( 7, 'About us', [ '' ] );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// A category can carry the same number as a page.
	it( 'does not match a taxonomy link by the page id', async () => {
		withMenus( { 10: [ link( 7, 'News', [], { type: 'category', kind: 'taxonomy' } ) ] } );

		await renameNavigationItem( 7, 'About us' );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );

describe( 'getMenuIdsToRelabel', () => {
	// Snapshotting a menu the rename leaves alone would let a later undo
	// overwrite whatever the user changed there since.
	it( 'lists only the menus the rename will change', async () => {
		withMenus( { 10: [ link( 7, 'About' ) ], 20: [ link( 7, 'Learn more' ) ] } );

		await expect( getMenuIdsToRelabel( 7, [ 'About' ] ) ).resolves.toEqual( [ 10 ] );
	} );
} );

describe( 'prefetchMenus', () => {
	// The same request as the later read, so the two share one resolution.
	it( 'requests the menu list as the reads do, and swallows a failure', async () => {
		const getEntityRecords = jest.fn().mockRejectedValue( new Error( 'offline' ) );
		( resolveSelect as jest.Mock ).mockReturnValue( { getEntityRecords } );

		expect( () => prefetchMenus() ).not.toThrow();
		await Promise.resolve();

		expect( getEntityRecords ).toHaveBeenCalledWith( 'postType', 'wp_navigation', {
			per_page: -1,
			status: [ 'publish', 'draft' ],
		} );
	} );
} );

describe( 'removeNavigationItem', () => {
	it( 'removes the deleted page from the menu', async () => {
		withMenus( { 10: [ link( 1, 'Home' ), link( 7, 'About' ) ] } );

		await removeNavigationItem( 7 );

		expect( lastWrite().items ).toEqual( [ link( 1, 'Home' ) ] );
		// The page is already deleted, so the menu change has no page edit to
		// save alongside — left unsaved, a reload brings the item back.
		expectItemsSaved( 10 );
	} );

	// A submenu entry left behind points at a page that no longer exists, and
	// removing it leaves the top level the same size — so a length check would
	// miss the write.
	it( 'removes it from inside a submenu too', async () => {
		withMenus( {
			10: [ { ...link( 1, 'Company', [ link( 7, 'About' ) ] ), name: 'core/navigation-submenu' } ],
		} );

		await removeNavigationItem( 7 );

		expect( lastWrite().items[ 0 ].innerBlocks ).toEqual( [] );
		// The block type draws the dropdown arrow, so a submenu with nothing
		// left in it would still show a chevron.
		expect( lastWrite().items[ 0 ].name ).toBe( 'core/navigation-link' );
	} );

	// A template can keep a `ref` to a menu deleted since; there is no link
	// left there to keep in step.
	it( 'skips a rendered ref whose menu no longer exists', async () => {
		withMenus( { 10: [ link( 7, 'About' ) ] }, [ '10', '99' ] );

		await removeNavigationItem( 7 );

		expect( editEntityRecord ).toHaveBeenCalledTimes( 1 );
		expect( lastWrite().menuId ).toBe( 10 );
	} );

	// The page is already gone, so a retry could not finish a removal that
	// stopped part-way: nothing is written until every menu has been read.
	it( 'writes nothing when a later menu cannot be read', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 7, 'About' ) ], 99: [ link( 7, 'About' ) ] }, [ '10' ] );
		const resolvers = ( resolveSelect as jest.Mock )();
		( resolveSelect as jest.Mock ).mockReturnValue( {
			...resolvers,
			getEditedEntityRecord: ( kind: string, name: string, id: number ) =>
				id === 99
					? Promise.reject( new Error( 'menu 99 is unreadable' ) )
					: resolvers.getEditedEntityRecord( kind, name, id ),
		} );

		await expect( removeNavigationItem( 7 ) ).rejects.toThrow( 'menu 99 is unreadable' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// The page is gone either way, so every menu that can be saved is; the one
	// that cannot has its items put back and is named for the model.
	it( 'saves every menu it can when one save fails', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 7, 'About' ) ], 99: [ link( 7, 'About' ) ] }, [ '10' ] );
		saveSpecifiedEntityEdits.mockImplementation( ( _kind, _name, id ) =>
			id === 99 ? Promise.reject( new Error( 'menu 99 is locked' ) ) : Promise.resolve()
		);

		await expect( removeNavigationItem( 7 ) ).rejects.toThrow( 'Could not save menu 99' );

		expectItemsSaved( 10 );
		expect( lastWrite() ).toMatchObject( { menuId: 99, items: [ link( 7, 'About' ) ] } );
	} );

	it( 'saves the menus without unsaved edits, and returns the one with', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 7, 'About' ) ], 99: [ link( 7, 'About' ) ] }, [ '10' ], {
			unsaved: [ '99' ],
		} );

		expect( await removeNavigationItem( 7 ) ).toEqual( [ 99 ] );
		expectItemsSaved( 10 );
		expect( saveSpecifiedEntityEdits ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'writes nothing when the page is not in any menu', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ] } );

		await removeNavigationItem( 7 );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// An edited menu carries its items as `blocks`; an empty array there is a
	// cleared menu, not a cue to reparse the saved content.
	it( 'reads an emptied menu as empty', async () => {
		withMenus( { 10: [] } );
		( resolveSelect as jest.Mock ).mockReturnValue( {
			getEditedEntityRecord: () =>
				Promise.resolve( { id: 10, blocks: [], content: '<!-- wp:navigation-link -->' } ),
			getEntityRecords: () => Promise.resolve( [ { id: 10 } ] ),
		} );

		await removeNavigationItem( 7 );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// The url names the page: a link elsewhere that shares its title is not its
	// item, and a custom label does not make it another link.
	it( 'matches an idless link by its url, whatever its label', async () => {
		withMenus( {
			10: [
				link( undefined, 'About', [], { url: 'https://elsewhere.com/about/' } ),
				link( undefined, 'Get in touch', [], { url: '/about/' } ),
			],
		} );

		await removeNavigationItem( 7, 'http://localhost/about/' );

		expect(
			lastWrite().items.map( ( item: { attributes: { url?: string } } ) => item.attributes.url )
		).toEqual( [ 'https://elsewhere.com/about/' ] );
	} );

	// A block that is not a menu item can link to the page too.
	it( 'ignores a block that is not a menu item, whatever it links to', async () => {
		withMenus( {
			10: [
				{ name: 'core/social-link', attributes: { url: '/about/' }, innerBlocks: [] },
				link( 7, 'About' ),
			],
		} );

		await removeNavigationItem( 7, 'http://localhost/about/' );

		expect( lastWrite().items.map( ( item: { name: string } ) => item.name ) ).toEqual( [
			'core/social-link',
		] );
	} );

	// The children point at pages that still exist.
	it( "promotes a deleted parent's children a level up", async () => {
		withMenus( {
			10: [
				{
					...link( 7, 'Services', [ link( 8, 'Web' ), link( 9, 'Design' ) ] ),
					name: 'core/navigation-submenu',
				},
				link( 1, 'Home' ),
			],
		} );

		await removeNavigationItem( 7 );

		expect(
			lastWrite().items.map( ( item: { attributes: { label?: string } } ) => item.attributes.label )
		).toEqual( [ 'Web', 'Design', 'Home' ] );
	} );
} );
