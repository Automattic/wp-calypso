jest.mock( '../provider-store', () => ( { providerSelectors: jest.fn() } ) );

import type * as BlockIds from '../block-ids';

// The map lasts for the page load, so each test starts from a fresh module.
function loadBlockIds( providerMap?: Record< string, string > ) {
	jest.resetModules();
	jest
		.requireMock( '../provider-store' )
		.providerSelectors.mockReturnValue(
			providerMap && { getFullPageStructure: () => ( { clientIdMap: providerMap } ) }
		);

	return jest.requireActual< typeof BlockIds >( '../block-ids' );
}

afterEach( () => jest.restoreAllMocks() );

it( 'gives a block the same short id on every lookup, and resolves it back', () => {
	const { createShortIdLookup, resolveClientId } = loadBlockIds();

	const hero = createShortIdLookup().toShortId( 'uuid-hero' );
	const next = createShortIdLookup();

	expect( next.toShortId( 'uuid-hero' ) ).toBe( hero );
	expect( next.toShortId( 'uuid-footer' ) ).not.toBe( hero );
	expect( resolveClientId( hero ) ).toBe( 'uuid-hero' );
} );

// Digits alone would read as a page id or a menu `ref`.
it( 'mints four characters, a letter first, past an id already taken', () => {
	const providerMap = { aaaa: 'uuid-taken' };
	const { toShortId } = loadBlockIds( providerMap ).createShortIdLookup();

	// Four picks of the first character make `aaaa`; the next four, `z999`.
	const random = jest.spyOn( Math, 'random' ).mockReturnValue( 0.999 );
	[ 0, 0, 0, 0 ].forEach( ( value ) => random.mockReturnValueOnce( value ) );

	expect( toShortId( 'uuid-hero' ) ).toBe( 'z999' );
	expect( providerMap ).toEqual( { aaaa: 'uuid-taken', z999: 'uuid-hero' } );
} );

it( 'finds a short id only once the block has one', () => {
	const { toShortId, findShortId } = loadBlockIds().createShortIdLookup();

	expect( findShortId( 'uuid-hero' ) ).toBeUndefined();

	const hero = toShortId( 'uuid-hero' );

	expect( findShortId( 'uuid-hero' ) ).toBe( hero );
} );

// `get-block-tree` and WebMCP hand out clientIds unshortened, and an id from
// the agent is raw input: `constructor` must not read `Object.prototype`.
it.each( [ 'uuid-hero', 'constructor' ] )(
	'takes %p, an id it does not hold, as a clientId',
	( id ) => {
		expect( loadBlockIds().resolveClientId( id ) ).toBe( id );
	}
);

// A replaced block keeps the id the agent knows it by, whichever form the call used.
it( 'repoints a short id, or every short id that stood for a replaced block', () => {
	const { createShortIdLookup, repointBlockId, resolveClientId } = loadBlockIds();
	const shortId = createShortIdLookup().toShortId( 'uuid-old' );

	repointBlockId( shortId, 'uuid-new' );

	expect( resolveClientId( shortId ) ).toBe( 'uuid-new' );

	repointBlockId( 'uuid-new', 'uuid-newer' );

	expect( resolveClientId( shortId ) ).toBe( 'uuid-newer' );
} );

// TODO (ability-migration): Goes with the shared map in `block-ids.ts`.
describe( "with Big Sky's map", () => {
	// Big Sky looks a block up in its map before minting, and resolves through
	// it, so one object keeps both sides on the same ids.
	it( 'reuses the ids it holds', () => {
		const { createShortIdLookup, resolveClientId } = loadBlockIds( { bMnU: 'uuid-hero' } );

		expect( createShortIdLookup().toShortId( 'uuid-hero' ) ).toBe( 'bMnU' );
		expect( resolveClientId( 'bMnU' ) ).toBe( 'uuid-hero' );
	} );

	it( 'carries over the ids handed out before its store appeared', () => {
		const blockIds = loadBlockIds();
		const hero = blockIds.createShortIdLookup().toShortId( 'uuid-hero' );
		const providerMap: Record< string, string > = {};

		jest.requireMock( '../provider-store' ).providerSelectors.mockReturnValue( {
			getFullPageStructure: () => ( { clientIdMap: providerMap } ),
		} );

		expect( blockIds.createShortIdLookup().toShortId( 'uuid-hero' ) ).toBe( hero );
		expect( providerMap ).toEqual( { [ hero ]: 'uuid-hero' } );
	} );
} );

it( 'keeps the menu items of the last page structure only', () => {
	const { setMenuItemAttributes, getMenuItemAttributes } = loadBlockIds();

	setMenuItemAttributes( new Map( [ [ 'abcd', { label: 'About' } ] ] ) );
	setMenuItemAttributes( new Map( [ [ 'efgh', { label: 'Services' } ] ] ) );

	expect( getMenuItemAttributes( 'abcd' ) ).toBeUndefined();
	expect( getMenuItemAttributes( 'efgh' ) ).toEqual( { label: 'Services' } );
} );
