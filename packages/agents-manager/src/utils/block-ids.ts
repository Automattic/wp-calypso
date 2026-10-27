/**
 * The short ids the agent addresses blocks by: the page structure lists every
 * block, and a clientId is a 36-character UUID. The map lasts for the page
 * load, since the agent may send back an id from turns ago; ids are random, so
 * one from an earlier load resolves to nothing rather than to another block.
 */

import type { BlockAttributes } from './editor-blocks';

type ClientIdMap = Record< string, string >;

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const CHARACTERS = `${ LETTERS }0123456789`;

const clientIdMap: ClientIdMap = {};
let menuItemAttributes = new Map< string, BlockAttributes >();

const pick = ( characters: string ): string =>
	characters[ Math.floor( Math.random() * characters.length ) ];

// Letter first: an id made of digits would read as a page id or a menu `ref`.
function mintShortId(): string {
	let shortId: string;

	do {
		shortId = pick( LETTERS ) + pick( CHARACTERS ) + pick( CHARACTERS ) + pick( CHARACTERS );
	} while ( Object.hasOwn( clientIdMap, shortId ) );

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
	const shortIds = new Map(
		Object.entries( clientIdMap ).map( ( [ shortId, clientId ] ) => [ clientId, shortId ] )
	);

	return {
		toShortId: ( clientId ) => {
			let shortId = shortIds.get( clientId );

			if ( ! shortId ) {
				shortId = mintShortId();
				clientIdMap[ shortId ] = clientId;
				shortIds.set( clientId, shortId );
			}

			return shortId;
		},

		findShortId: ( clientId ) => shortIds.get( clientId ),
	};
}

/**
 * The id the agent knows a block by, so a host can name the block to it.
 * Minted when the block has none yet: the next page structure lists the block
 * under the same id.
 */
export const getAgentBlockId = ( clientId: string ): string =>
	createShortIdLookup().toShortId( clientId );

/**
 * The clientId a short id stands for. An id the map does not hold is taken as
 * a clientId already: `get-block-tree`, WebMCP and the Jetpack AI sidebar hand
 * those out unshortened.
 */
export function resolveClientId( id: string ): string {
	return Object.hasOwn( clientIdMap, id ) ? clientIdMap[ id ] : id;
}

/**
 * Points the short ids that stood for a block at the one that replaced it:
 * `id` is a short id, or the clientId the agent's ids resolved to.
 */
export function repointBlockId( id: string, clientId: string ): void {
	if ( Object.hasOwn( clientIdMap, id ) ) {
		clientIdMap[ id ] = clientId;

		return;
	}

	Object.keys( clientIdMap )
		.filter( ( shortId ) => clientIdMap[ shortId ] === id )
		.forEach( ( shortId ) => {
			clientIdMap[ shortId ] = clientId;
		} );
}

/**
 * Keeps the attributes of the menu items in the last page structure, by short
 * id. A menu the view does not render lists its record's items, whose clientIds
 * name no block; what the structure showed for an item still says which one it is.
 */
export function setMenuItemAttributes( attributes: Map< string, BlockAttributes > ): void {
	menuItemAttributes = attributes;
}

export const getMenuItemAttributes = ( shortId: string ): BlockAttributes | undefined =>
	menuItemAttributes.get( shortId );
