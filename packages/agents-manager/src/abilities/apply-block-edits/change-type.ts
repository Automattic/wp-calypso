/**
 * What kind of change a call makes: a plain text edit the chat can offer inline
 * actions on, and an edit to a saved menu, whose items live in the menu's
 * record rather than the page's blocks.
 */

import { getBlockParents } from '../../utils/editor-blocks';
import {
	getMenuIdAround,
	getMenuIdOf,
	isMenuId,
	isSameMenuId,
	type MenuId,
} from '../../utils/navigation-menu';
import { isUpdateOnly } from './normalize-edits';
import type { BlockEdits, ChangeType, ResolveClientId } from './types';

const TEXT_ATTRIBUTES = [ 'content', 'text', 'label' ];

/** `text-content` when every edit sets one text attribute of an existing block and nothing else. */
export function getChangeType( edits: BlockEdits ): ChangeType {
	if ( ! isUpdateOnly( edits ) ) {
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
 * target sits inside, an insert lands under, or an update lists the items of.
 * A navigation block's own attributes are in the page's blocks, so an update
 * of those alone names no menu.
 */
export function getEditedMenuIds( edits: BlockEdits, resolve: ResolveClientId ): MenuId[] {
	const above = ( id: string ) => getMenuIdOf( getBlockParents( resolve( id ) ) );
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
