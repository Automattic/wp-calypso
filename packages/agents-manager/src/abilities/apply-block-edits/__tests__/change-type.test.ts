jest.mock( '../../../utils/editor-blocks', () => ( {
	getBlock: jest.fn(),
	getBlockParents: jest.fn(),
} ) );
jest.mock( '../../../utils/navigation-menu', () => ( {
	NAVIGATION_BLOCK: 'core/navigation',
	isMenuId: ( value: unknown ) =>
		typeof value === 'number' || ( typeof value === 'string' && !! value ),
	isSameMenuId: ( a: unknown, b: unknown ) => String( a ) === String( b ),
} ) );

import { getBlock, getBlockParents } from '../../../utils/editor-blocks';
import { getChangeType, getEditedMenuIds } from '../change-type';
import type { EditorBlock } from '../../../utils/editor-blocks';
import type { BlockEdits, BlockUpdate } from '../types';

const edits = ( partial: Partial< BlockEdits > ): BlockEdits => ( {
	updates: [],
	inserts: [],
	deletes: [],
	...partial,
} );

const contentUpdate: BlockUpdate = {
	clientId: 'para',
	name: 'core/paragraph',
	attributes: { content: 'After' },
};

beforeEach( () => jest.resetAllMocks() );

describe( 'getChangeType', () => {
	it.each( [
		[ 'one text attribute per update', { updates: [ contentUpdate ] }, 'text-content' ],
		[
			'a `label` with the children left as they are',
			{ updates: [ { ...contentUpdate, attributes: { label: 'Go' }, innerBlocks: [] } ] },
			'text-content',
		],
		[
			'a text attribute beside another one',
			{ updates: [ { ...contentUpdate, attributes: { content: 'After', className: 'x' } } ] },
			'other',
		],
		[
			'a text attribute with a reorder of the children',
			{
				updates: [
					{ ...contentUpdate, innerBlocks: [ { clientId: 'child', name: 'core/paragraph' } ] },
				],
			},
			'other',
		],
		[
			'a text update with a delete beside it',
			{ updates: [ contentUpdate ], deletes: [ 'gone' ] },
			'other',
		],
		[
			'a text update with custom CSS beside it',
			{ updates: [ contentUpdate ], customCSS: '' },
			'other',
		],
		[ 'no update at all', { inserts: [ { block: { name: 'core/group' } } ] }, 'other' ],
	] )( 'is `%s` for %s', ( _, partial, expected ) => {
		expect( getChangeType( edits( partial ) ) ).toBe( expected );
	} );
} );

describe( 'getEditedMenuIds', () => {
	const blocks: Record< string, EditorBlock > = {
		nav: { clientId: 'nav', name: 'core/navigation', attributes: { ref: 19 }, innerBlocks: [] },
		link: { clientId: 'link', name: 'core/navigation-link', attributes: {}, innerBlocks: [] },
		sub: { clientId: 'sub', name: 'core/navigation-submenu', attributes: {}, innerBlocks: [] },
		unsaved: { clientId: 'unsaved', name: 'core/navigation', attributes: {}, innerBlocks: [] },
		para: { clientId: 'para', name: 'core/paragraph', attributes: {}, innerBlocks: [] },
	};
	const parents: Record< string, string[] > = { link: [ 'nav' ], sub: [ 'nav', 'link' ] };
	const resolve = ( id: string ) => ( id === 'short-link' ? 'link' : id );

	beforeEach( () => {
		jest.mocked( getBlock ).mockImplementation( ( clientId ) => blocks[ clientId ] );
		jest.mocked( getBlockParents ).mockImplementation( ( clientId ) => parents[ clientId ] ?? [] );
	} );

	// The menu's record holds its items, so each target is traced to the
	// `core/navigation` it sits in; the block's own attributes are the page's.
	it.each( [
		[
			'an update inside a saved menu',
			{ updates: [ { ...contentUpdate, clientId: 'short-link' } ] },
		],
		[ 'a delete inside a saved menu', { deletes: [ 'sub' ] } ],
		[
			'an insert under a saved menu, at any depth',
			{ inserts: [ { parentClientId: 'link', block: { name: 'core/navigation-link' } } ] },
		],
		[
			'an update listing the items of a saved menu',
			{ updates: [ { ...contentUpdate, clientId: 'nav', innerBlocks: [ { clientId: 'link' } ] } ] },
		],
	] )( 'names the menu for %s', ( _, partial ) => {
		expect( getEditedMenuIds( edits( partial ), resolve ) ).toEqual( [ 19 ] );
	} );

	it.each( [
		[
			"the navigation block's own attributes",
			{ updates: [ { ...contentUpdate, clientId: 'nav' } ] },
		],
		[
			'an unsaved navigation',
			{ inserts: [ { parentClientId: 'unsaved', block: { name: 'x' } } ] },
		],
		[ 'blocks outside any menu', { updates: [ contentUpdate ], deletes: [ 'missing' ] } ],
	] )( 'names no menu for %s', ( _, partial ) => {
		expect( getEditedMenuIds( edits( partial ), resolve ) ).toEqual( [] );
	} );

	it( 'names a menu once, however many edits reach it', () => {
		const partial = {
			updates: [ { ...contentUpdate, clientId: 'short-link' } ],
			deletes: [ 'sub' ],
		};

		expect( getEditedMenuIds( edits( partial ), resolve ) ).toEqual( [ 19 ] );
	} );
} );
