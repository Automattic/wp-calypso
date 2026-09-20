/**
 * What kind of change a call makes: a plain text edit the chat can offer inline
 * actions on, and an edit to a saved menu, whose items live in the menu's
 * record rather than the page's blocks.
 */

import { getBlock, getBlockParents } from '../../utils/editor-blocks';
import { isMenuId, isSameMenuId, NAVIGATION_BLOCK, type MenuId } from '../../utils/navigation-menu';
import type { BlockEdits, ChangeType, ResolveClientId } from './types';

const TEXT_ATTRIBUTES = [ 'content', 'text', 'label' ];

/** `text-content` when every edit sets one text attribute of an existing block and nothing else. */
export function getChangeType( edits: BlockEdits ): ChangeType {
	if (
		! edits.updates.length ||
		edits.inserts.length ||
		edits.deletes.length ||
		typeof edits.customCSS === 'string'
	) {
		return 'other';
	}

	const isTextOnly = edits.updates.every( ( update ) => {
		const keys = Object.keys( update.attributes || {} );

		return (
			keys.length === 1 && TEXT_ATTRIBUTES.includes( keys[ 0 ] ) && ! update.innerBlocks?.length
		);
	} );

	return isTextOnly ? 'text-content' : 'other';
}

const menuOf = ( chain: string[] ): MenuId | undefined => {
	const navigation = chain.map( getBlock ).find( ( block ) => block?.name === NAVIGATION_BLOCK );
	const ref = navigation?.attributes.ref;

	return isMenuId( ref ) ? ref : undefined;
};

/** The saved menu `clientId` sits in, or is, by the `ref` of its navigation block. */
export const getMenuIdAround = ( clientId: string ): MenuId | undefined =>
	menuOf( [ clientId, ...getBlockParents( clientId ) ] );

/**
 * The saved menus the edits reach, by the `ref` of the navigation block a
 * target sits inside, an insert lands under, or an update lists the items of.
 * A navigation block's own attributes are in the page's blocks, so an update
 * of those alone names no menu.
 */
export function getEditedMenuIds( edits: BlockEdits, resolve: ResolveClientId ): MenuId[] {
	const above = ( id: string ) => menuOf( getBlockParents( resolve( id ) ) );
	const around = ( id: string ) => getMenuIdAround( resolve( id ) );
	const menuIds = [
		...edits.updates.map( ( update ) =>
			update.innerBlocks?.length ? around( update.clientId ) : above( update.clientId )
		),
		...edits.deletes.map( above ),
		...edits.inserts.map( ( insert ) =>
			insert.parentClientId ? around( insert.parentClientId ) : undefined
		),
	].filter( isMenuId );

	return menuIds.filter(
		( id, index ) => menuIds.findIndex( ( o ) => isSameMenuId( o, id ) ) === index
	);
}
