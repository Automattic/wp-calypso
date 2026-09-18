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

/**
 * The saved menus the edits reach, by the `ref` of the navigation block a
 * target sits inside or an insert lands under. A target that is the navigation
 * block itself names no menu: its own attributes are in the page's blocks.
 */
export function getEditedMenuIds( edits: BlockEdits, resolve: ResolveClientId ): MenuId[] {
	const menuOf = ( chain: string[] ): MenuId | undefined => {
		const navigation = chain.map( getBlock ).find( ( block ) => block?.name === NAVIGATION_BLOCK );
		const ref = navigation?.attributes.ref;

		return isMenuId( ref ) ? ref : undefined;
	};
	const above = ( id: string ) => getBlockParents( resolve( id ) );
	const under = ( id?: string | null ) => ( id ? [ resolve( id ), ...above( id ) ] : [] );
	const menuIds = [
		...edits.updates.map( ( update ) => menuOf( above( update.clientId ) ) ),
		...edits.deletes.map( ( id ) => menuOf( above( id ) ) ),
		...edits.inserts.map( ( insert ) => menuOf( under( insert.parentClientId ) ) ),
	].filter( isMenuId );

	return menuIds.filter(
		( id, index ) => menuIds.findIndex( ( o ) => isSameMenuId( o, id ) ) === index
	);
}
