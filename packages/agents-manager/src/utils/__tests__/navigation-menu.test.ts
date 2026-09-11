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

import { dispatch, resolveSelect, select } from '@wordpress/data';
import {
	addNavigationItem,
	getMenuIdsToRelabel,
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
function withMenus( menus: Record< string, unknown[] >, rendered = Object.keys( menus ) ) {
	( select as jest.Mock ).mockReturnValue( {
		getBlocksByName: () => rendered.map( ( id ) => `client-${ id }` ),
		getBlock: ( clientId: string ) => ( {
			attributes: { ref: Number( clientId.replace( 'client-', '' ) ) },
		} ),
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
const savedItemsOf = ( menuId: number ) =>
	expect( saveSpecifiedEntityEdits ).toHaveBeenCalledWith(
		'postType',
		'wp_navigation',
		menuId,
		[ 'blocks', 'content' ],
		{ throwOnError: true }
	);

/** The items the last write sent, and the menu it wrote to. */
const lastWrite = () => {
	const call = editEntityRecord.mock.calls.at( -1 );
	return { menuId: call[ 2 ], items: call[ 3 ].blocks };
};

beforeEach( () => jest.clearAllMocks() );

describe( 'addNavigationItem', () => {
	it( 'appends the new page to the menu', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ] } );

		await addNavigationItem( { label: 'About', id: 7, url: '/about/' } );

		expect( lastWrite().items ).toHaveLength( 2 );
		expect( lastWrite().items[ 1 ].attributes ).toMatchObject( { label: 'About', id: 7 } );
		// The page itself is already saved, so an unsaved menu item would vanish
		// on the next reload and leave the new page unlinked.
		savedItemsOf( 10 );
	} );

	// The rendered list holds header and footer alike, so its first entry is
	// not necessarily the menu a new page belongs in.
	it( 'adds to the site menu rather than the first rendered one', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 1, 'Footer' ) ], 99: [ link( 1, 'Home' ) ] }, [ '10' ] );

		await addNavigationItem( { label: 'About', id: 7 } );

		expect( lastWrite().menuId ).toBe( 99 );
	} );

	it( 'falls back to a rendered menu when the site names none', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( {} );
		withMenus( { 10: [ link( 1, 'Home' ) ] } );

		await addNavigationItem( { label: 'About', id: 7 } );

		expect( lastWrite().menuId ).toBe( 10 );
	} );

	// An unread site record would look like a site naming no menu, and the page
	// would land in the first rendered one — the footer, say.
	it( 'refuses when the site settings cannot be read', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValueOnce( undefined );
		withMenus( { 10: [ link( 1, 'Home' ) ] } );

		await expect( addNavigationItem( { label: 'About', id: 7 } ) ).rejects.toThrow(
			'site settings could not be read'
		);
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// A Page List shows every published page on its own; a link beside it
	// would show the new page twice.
	it( 'skips a menu whose Page List shows the page already', async () => {
		const pageList = ( parentPageID?: number ) => ( {
			name: 'core/page-list',
			attributes: { parentPageID },
			innerBlocks: [],
		} );

		withMenus( { 10: [ link( 1, 'Home', [ pageList() ] ) ] } );
		await addNavigationItem( { label: 'About', id: 7 } );
		expect( editEntityRecord ).not.toHaveBeenCalled();

		withMenus( { 10: [ pageList( 3 ) ] } );
		await addNavigationItem( { label: 'About', id: 7, parent: 3 } );
		expect( editEntityRecord ).not.toHaveBeenCalled();

		withMenus( { 10: [ pageList( 3 ) ] } );
		await addNavigationItem( { label: 'About', id: 7 } );
		expect( lastWrite().items ).toHaveLength( 2 );
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
} );

describe( 'renameNavigationItem', () => {
	it( 'relabels the item pointing at the page', async () => {
		withMenus( { 10: [ link( 1, 'Home' ), link( 7, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us' );

		expect( lastWrite().items[ 1 ].attributes.label ).toBe( 'About us' );
	} );

	it( 'writes only the menus that hold the page', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ], 20: [ link( 7, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us' );

		expect( editEntityRecord ).toHaveBeenCalledTimes( 1 );
		expect( lastWrite().menuId ).toBe( 20 );
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
	// does not follow it, so it is the user's.
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

describe( 'removeNavigationItem', () => {
	it( 'removes the deleted page from the menu', async () => {
		withMenus( { 10: [ link( 1, 'Home' ), link( 7, 'About' ) ] } );

		await removeNavigationItem( 7 );

		expect( lastWrite().items ).toEqual( [ link( 1, 'Home' ) ] );
		// The page is already deleted, so the menu change has no page edit to
		// save alongside — left unsaved, a reload brings the item back.
		savedItemsOf( 10 );
	} );

	// A submenu entry left behind points at a page that no longer exists, and
	// removing it leaves the top level the same size — so a length check would
	// miss the write.
	it( 'removes it from inside a submenu too', async () => {
		withMenus( { 10: [ link( 1, 'Company', [ link( 7, 'About' ) ] ) ] } );

		await removeNavigationItem( 7 );

		expect( lastWrite().items[ 0 ].innerBlocks ).toEqual( [] );
		// The block type draws the dropdown arrow, so a submenu with nothing
		// left in it would still show a chevron.
		expect( lastWrite().items[ 0 ].name ).toBe( 'core/navigation-link' );
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

		savedItemsOf( 10 );
		expect( lastWrite() ).toEqual( { menuId: 99, items: [ link( 7, 'About' ) ] } );
		saveSpecifiedEntityEdits.mockReset();
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
} );

describe( 'menu selection', () => {
	// A page linked from both the header and the footer has to be renamed in
	// both, or one menu keeps the old label. Rendered menus come first.
	// The label no longer follows the page, so it is the user's. Matching by id
	// must not make a page rename overwrite it.
	it( 'leaves a label the user chose, even on an id-backed item', async () => {
		withMenus( { 10: [ link( 7, 'Learn more' ) ] } );

		await renameNavigationItem( 7, 'About us', [ 'About' ] );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'renames the page in every menu that holds it', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 7, 'About' ) ], 99: [ link( 7, 'About' ) ] }, [ '10' ] );

		await renameNavigationItem( 7, 'About us' );

		expect( editEntityRecord.mock.calls.map( ( call ) => call[ 2 ] ) ).toEqual( [ 10, 99 ] );
	} );

	it( 'falls back to the metadata menu when the editor renders none', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 99: [ link( 7, 'About' ) ] }, [] );

		await renameNavigationItem( 7, 'About us' );

		expect( lastWrite().menuId ).toBe( 99 );
	} );

	// A link elsewhere that happens to share the page's title is not its item.
	it( 'leaves an idless link with the same label but another url alone', async () => {
		withMenus( {
			10: [
				link( undefined, 'About', [], { url: 'https://elsewhere.com/about/' } ),
				link( undefined, 'About', [], { url: '/about/' } ),
			],
		} );

		await removeNavigationItem( 7, 'http://localhost/about/' );

		expect(
			lastWrite().items.map( ( item: { attributes: { url?: string } } ) => item.attributes.url )
		).toEqual( [ 'https://elsewhere.com/about/' ] );
	} );

	// The url names the page whatever the user called the link.
	it( 'removes an idless link by its url even under a custom label', async () => {
		withMenus( { 10: [ link( undefined, 'Get in touch', [], { url: '/about/' } ) ] } );

		await removeNavigationItem( 7, 'http://localhost/about/' );

		expect( lastWrite().items ).toEqual( [] );
	} );

	// Plain permalinks differ only in the query.
	it( 'tells plain-permalink links apart by their query', async () => {
		withMenus( { 10: [ link( undefined, 'About', [], { url: '/?page_id=8' } ) ] } );

		await removeNavigationItem( 7, 'http://localhost/?page_id=7' );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// A block that is not a menu item can carry a label too.
	it( 'ignores a block that is not a menu item, whatever its label', async () => {
		withMenus( {
			10: [
				{ name: 'core/search', attributes: { label: 'About' }, innerBlocks: [] },
				link( 7, 'About' ),
			],
		} );

		await removeNavigationItem( 7 );

		expect( lastWrite().items.map( ( item: { name: string } ) => item.name ) ).toEqual( [
			'core/search',
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

	// A save that silently never ran would report a menu change the next
	// reload throws away.
	it( 'refuses when the save action is unavailable, and puts the menu back', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( {} );
		withMenus( { 10: [ link( 1, 'Home' ) ] } );
		( dispatch as jest.Mock ).mockReturnValue( { editEntityRecord } );

		await expect( addNavigationItem( { label: 'About', id: 7 } ) ).rejects.toThrow(
			'unavailable to save'
		);
		expect( editEntityRecord ).toHaveBeenCalledTimes( 2 );
	} );

	// A menu neither on screen nor named by the site still holds its links.
	it( 'reaches a menu that is neither rendered nor named', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( {} );
		withMenus( { 10: [ link( 1, 'Home' ) ], 30: [ link( 7, 'About' ) ] }, [ '10' ] );

		await removeNavigationItem( 7 );

		expect( lastWrite().menuId ).toBe( 30 );
	} );
} );
