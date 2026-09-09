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
import { addNavigationItem, removeNavigationItem, renameNavigationItem } from '../navigation-menu';
import { getSiteMetadata } from '../site-metadata';

const editEntityRecord = jest.fn();
const saveEditedEntityRecord = jest.fn();

const link = ( id: number | string | undefined, label: string, innerBlocks: unknown[] = [] ) => ( {
	name: 'core/navigation-link',
	attributes: { id, label },
	innerBlocks,
} );

/** Serves `menus` by id, and reports which menus the editor renders. */
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
	} );
	( dispatch as jest.Mock ).mockReturnValue( { editEntityRecord, saveEditedEntityRecord } );
}

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
		expect( saveEditedEntityRecord ).toHaveBeenCalledWith( 'postType', 'wp_navigation', 10, {
			throwOnError: true,
		} );
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

	it( 'does nothing when the site has no menu', async () => {
		withMenus( {}, [] );

		await addNavigationItem( { label: 'About', id: 7 } );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );

describe( 'renameNavigationItem', () => {
	it( 'relabels the item pointing at the page', async () => {
		withMenus( { 10: [ link( 1, 'Home' ), link( 7, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us' );

		expect( lastWrite().items[ 1 ].attributes.label ).toBe( 'About us' );
	} );

	it( 'stops at the menu holding the page, leaving the others alone', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ], 20: [ link( 7, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us' );

		expect( editEntityRecord ).toHaveBeenCalledTimes( 1 );
		expect( lastWrite().menuId ).toBe( 20 );
	} );

	// An idless item is matched by label, but only the one it had before this
	// edit — a label the user changed by hand is theirs to keep.
	it( 'matches an idless item by its previous label', async () => {
		withMenus( { 10: [ link( undefined, 'About' ) ] } );

		await renameNavigationItem( 7, 'About us', 'About' );

		expect( lastWrite().items[ 0 ].attributes.label ).toBe( 'About us' );
	} );

	it( 'leaves an idless item alone when its label no longer matches', async () => {
		withMenus( { 10: [ link( undefined, 'Our story' ) ] } );

		await renameNavigationItem( 7, 'About us', 'About' );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );

describe( 'removeNavigationItem', () => {
	it( 'removes the deleted page from the menu', async () => {
		withMenus( { 10: [ link( 1, 'Home' ), link( 7, 'About' ) ] } );

		await removeNavigationItem( 7 );

		expect( lastWrite().items ).toEqual( [ link( 1, 'Home' ) ] );
		// The page is already deleted, so the menu change has no page edit to
		// save alongside — left unsaved, a reload brings the item back.
		expect( saveEditedEntityRecord ).toHaveBeenCalledWith( 'postType', 'wp_navigation', 10, {
			throwOnError: true,
		} );
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

	it( 'writes nothing when the page is not in any menu', async () => {
		withMenus( { 10: [ link( 1, 'Home' ) ] } );

		await removeNavigationItem( 7 );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );

describe( 'menu selection', () => {
	// What the user is looking at is what they mean.
	it( 'prefers a rendered menu over the one site metadata names', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 10: [ link( 7, 'About' ) ], 99: [ link( 7, 'About' ) ] }, [ '10' ] );

		await renameNavigationItem( 7, 'About us' );

		expect( lastWrite().menuId ).toBe( 10 );
	} );

	it( 'falls back to the metadata menu when the editor renders none', async () => {
		( getSiteMetadata as jest.Mock ).mockReturnValue( { navigationId: 99 } );
		withMenus( { 99: [ link( 7, 'About' ) ] }, [] );

		await renameNavigationItem( 7, 'About us' );

		expect( lastWrite().menuId ).toBe( 99 );
	} );
} );
