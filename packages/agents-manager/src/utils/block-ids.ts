/**
 * The short ids the agent addresses blocks by: the page structure lists every
 * block, and a clientId is a 36-character UUID. The map lasts for the page
 * load, since the agent may send back an id from turns ago; ids are random, so
 * one from an earlier load resolves to nothing rather than to another block.
 */

import { providerSelectors } from './provider-store';
import type { BlockAttributes } from './editor-blocks';

type ClientIdMap = Record< string, string >;

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const CHARACTERS = `${ LETTERS }0123456789`;

let clientIdMap: ClientIdMap = {};
let menuItemAttributes = new Map< string, BlockAttributes >();

// TODO (ability-migration): Drop the shared map once Big Sky's context builder
// goes. It mints into the map its store holds and resolves through it, so
// working in that one object keeps both sides on the same id for the same block.
function getClientIdMap(): ClientIdMap {
	const provided = providerSelectors< {
		getFullPageStructure?: () => { clientIdMap?: ClientIdMap } | undefined;
	} >()?.getFullPageStructure?.()?.clientIdMap;

	if ( provided && provided !== clientIdMap ) {
		clientIdMap = Object.assign( provided, clientIdMap );
	}

	return clientIdMap;
}

const pick = ( characters: string ): string =>
	characters[ Math.floor( Math.random() * characters.length ) ];

// Letter first: an id made of digits would read as a page id or a menu `ref`.
function mintShortId( map: ClientIdMap ): string {
	let shortId: string;

	do {
		shortId = pick( LETTERS ) + pick( CHARACTERS ) + pick( CHARACTERS ) + pick( CHARACTERS );
	} while ( Object.hasOwn( map, shortId ) );

	return shortId;
}

/**
 * Gives each clientId its short id, minting one the first time. Indexes the
 * map once, so going through every block of a page stays linear.
 */
export function createShortIdLookup(): {
	toShortId: ( clientId: string ) => string;
	findShortId: ( clientId: string ) => string | undefined;
} {
	const map = getClientIdMap();

	const shortIds = new Map(
		Object.entries( map ).map( ( [ shortId, clientId ] ) => [ clientId, shortId ] )
	);

	return {
		toShortId: ( clientId ) => {
			let shortId = shortIds.get( clientId );

			if ( ! shortId ) {
				shortId = mintShortId( map );
				map[ shortId ] = clientId;
				shortIds.set( clientId, shortId );
			}

			return shortId;
		},

		findShortId: ( clientId ) => shortIds.get( clientId ),
	};
}

/**
 * The clientId a short id stands for. An id the map does not hold is taken as
 * a clientId already: `get-block-tree`, WebMCP and the Jetpack AI sidebar hand
 * those out unshortened.
 */
export function resolveClientId( id: string ): string {
	const map = getClientIdMap();

	return Object.hasOwn( map, id ) ? map[ id ] : id;
}

/** Points a short id at the block that replaced the one it stood for. */
export function repointShortId( shortId: string, clientId: string ): void {
	const map = getClientIdMap();

	if ( Object.hasOwn( map, shortId ) ) {
		map[ shortId ] = clientId;
	}
}

/**
 * Keeps the attributes of the menu items in the last page structure, by short
 * id. A menu's items live in its record, so their clientIds may resolve to no
 * block; what the structure showed for an item still says which one it is.
 */
export function setMenuItemAttributes( attributes: Map< string, BlockAttributes > ): void {
	menuItemAttributes = attributes;
}

export const getMenuItemAttributes = ( shortId: string ): BlockAttributes | undefined =>
	menuItemAttributes.get( shortId );
