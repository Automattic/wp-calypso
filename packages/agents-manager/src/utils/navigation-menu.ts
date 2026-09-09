import { createBlock, parse, serialize } from '@wordpress/blocks';
import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect, select } from '@wordpress/data';
import { getSiteMetadata } from './site-metadata';
import type { Block } from '@wordpress/blocks';

/**
 * The site's navigation menu, as `edit-entity-record` needs to touch it: a
 * page added to the site gets a menu item, a renamed page renames its item,
 * and a deleted page loses it.
 *
 * The menu is a `wp_navigation` entity whose blocks are the items. Edits go
 * through `editEntityRecord`, so they join the same unsaved-changes set as the
 * page edit that triggered them and save together.
 */

/** A menu item: `core/navigation-link`, or a submenu holding more of them. */
export type NavigationBlock = Block< Record< string, unknown > >;

interface NavigationRecord {
	id?: number | string;
	blocks?: NavigationBlock[];
	content?: unknown;
}

export interface NavigationItem {
	label: string;
	id: number | string;
	url?: string;
	type?: string;
	kind?: string;
}

const NAVIGATION_BLOCK = 'core/navigation';
export const NAVIGATION_LINK_BLOCK = 'core/navigation-link';
export const NAVIGATION_SUBMENU_BLOCK = 'core/navigation-submenu';

// Resolved by name to keep `@wordpress/block-editor` out of this module.
const BLOCK_EDITOR_STORE = 'core/block-editor';

interface BlockEditorSelect {
	getBlocksByName?: ( name: string ) => string[];
	getBlock?: ( clientId: string ) => { attributes?: { ref?: unknown } } | null;
}

interface CoreDispatch {
	editEntityRecord: (
		kind: string,
		name: string,
		id: number | string,
		edits: Record< string, unknown >,
		options: { undoIgnore: boolean }
	) => Promise< unknown >;
	saveEditedEntityRecord: (
		kind: string,
		name: string,
		id: number | string,
		options: { throwOnError: boolean }
	) => Promise< unknown >;
}

const normalizeLabel = ( label: unknown ) =>
	String( label ?? '' )
		.trim()
		.toLocaleLowerCase();

/** A record's items, from its blocks or by parsing its serialized content. */
const getItems = ( record: NavigationRecord ): NavigationBlock[] => {
	if ( Array.isArray( record.blocks ) && record.blocks.length ) {
		return record.blocks;
	}

	const content = record.content;
	const serialized =
		typeof content === 'string' ? content : ( content as { raw?: string } )?.raw ?? '';

	return serialized ? ( parse( serialized ) as NavigationBlock[] ) : [];
};

/**
 * The menus rendered by the open view. Preferred over the one site metadata
 * names: what the user is looking at is what they mean.
 */
// TODO (ability-migration): `editor-navigate` reads the same refs for its menu
// refresh. Whichever of the two lands second should call this instead.
function getRenderedMenuIds(): unknown[] {
	const blockEditor = select( BLOCK_EDITOR_STORE ) as unknown as BlockEditorSelect | undefined;

	return [
		...new Set(
			( blockEditor?.getBlocksByName?.( NAVIGATION_BLOCK ) ?? [] )
				.map( ( clientId ) => blockEditor?.getBlock?.( clientId )?.attributes?.ref )
				.filter( Boolean )
		),
	];
}

/** Every menu worth searching for a page, the rendered ones first. */
function getMenuIds(): unknown[] {
	const rendered = getRenderedMenuIds();
	const fromMetadata = getSiteMetadata()?.navigationId;

	if ( ! fromMetadata || rendered.includes( fromMetadata ) ) {
		return rendered;
	}

	return [ ...rendered, fromMetadata ];
}

/**
 * The menu a new page joins: the one the site names as its own.
 *
 * Not the first rendered one — that list holds every menu on screen, header
 * and footer alike, so a new page could land in the footer. A rendered menu is
 * the fallback for a site that names none.
 */
function getMenuIdForNewPage(): unknown {
	return getSiteMetadata()?.navigationId ?? getRenderedMenuIds()[ 0 ];
}

const readMenu = async ( id: unknown ): Promise< NavigationRecord | null > => {
	const record = await (
		resolveSelect( coreStore ) as unknown as {
			getEditedEntityRecord: (
				kind: string,
				name: string,
				id: unknown
			) => Promise< NavigationRecord | null >;
		}
	 ).getEditedEntityRecord( 'postType', 'wp_navigation', id );

	return record || null;
};

export const writeMenuItems = async ( id: unknown, items: NavigationBlock[] ): Promise< void > => {
	const coreDispatch = dispatch( coreStore ) as unknown as CoreDispatch | undefined;

	if ( ! coreDispatch ) {
		throw new Error( 'The navigation menu is unavailable to edit.' );
	}

	await coreDispatch.editEntityRecord(
		'postType',
		'wp_navigation',
		id as number | string,
		{ blocks: items, content: serialize( items ) },
		// Kept out of the editor's undo stack, as every other agent write is:
		// `restore-checkpoint` is the undo the agent offers.
		{ undoIgnore: true }
	);
};

/**
 * A menu's items, or `null` when it cannot be read.
 *
 * Always resolved to items: a menu nothing has edited yet carries only its
 * serialized `content`, so a caller reading `record.blocks` directly would see
 * nothing and conclude the menu was empty.
 */
export async function readMenuItems( id: unknown ): Promise< NavigationBlock[] | null > {
	const menu = await readMenu( id );

	return menu ? getItems( menu ) : null;
}

/** Whether any item matches, however deeply nested. */
const someItem = (
	items: NavigationBlock[],
	matches: ( item: NavigationBlock ) => boolean
): boolean =>
	items.some( ( item ) => matches( item ) || someItem( item.innerBlocks ?? [], matches ) );

/** Maps every item in the menu, however deeply nested. */
const mapItems = (
	items: NavigationBlock[],
	map: ( item: NavigationBlock ) => NavigationBlock
): NavigationBlock[] =>
	items.map( ( item ) => {
		const mapped = map( item );

		return mapped.innerBlocks?.length
			? { ...mapped, innerBlocks: mapItems( mapped.innerBlocks, map ) }
			: mapped;
	} );

/**
 * Drops every item matching `matches`, however deeply nested.
 *
 * A submenu that loses its last child becomes a plain link again: the block
 * type is what draws the dropdown arrow, so leaving it as a submenu shows a
 * chevron on an item with nothing to open.
 */
const rejectItems = (
	items: NavigationBlock[],
	matches: ( item: NavigationBlock ) => boolean
): NavigationBlock[] =>
	items
		.filter( ( item ) => ! matches( item ) )
		.map( ( item ) => {
			if ( ! item.innerBlocks?.length ) {
				return item;
			}

			const innerBlocks = rejectItems( item.innerBlocks, matches );
			const emptied = ! innerBlocks.length && item.name === NAVIGATION_SUBMENU_BLOCK;

			return { ...item, innerBlocks, ...( emptied && { name: NAVIGATION_LINK_BLOCK } ) };
		} );

/**
 * Whether an item points at `pageId`.
 *
 * An item that carries no id is matched by its label instead, but only against
 * the title the page had before this edit: a label the user has since changed
 * by hand is theirs, not ours to overwrite.
 */
const matchesPage =
	( pageId: number | string, previousLabel?: string ) => ( item: NavigationBlock ) => {
		const itemId = item.attributes?.id;

		if ( itemId ) {
			return String( itemId ) === String( pageId );
		}

		return (
			!! previousLabel &&
			normalizeLabel( item.attributes?.label ) === normalizeLabel( previousLabel )
		);
	};

/**
 * Persists a menu's pending edits, putting `previous` back if the save fails.
 *
 * A menu write following a page *edit* is left unsaved on purpose: the two join
 * one unsaved-changes set and save together. A write following a creation or
 * deletion has no such partner — the page change has already persisted — so
 * leaving it unsaved would let a reload throw it away while the page stands.
 *
 * The write is applied locally and `undoIgnore` keeps it out of the editor's
 * stack, so a refused save would otherwise strand it with no undo of any kind.
 * Errors are suppressed by default, which would report a menu change that never
 * reached the server as a success.
 */
const saveMenu = async ( id: unknown, previous: NavigationBlock[] ): Promise< void > => {
	const coreDispatch = dispatch( coreStore ) as unknown as CoreDispatch | undefined;

	try {
		await coreDispatch?.saveEditedEntityRecord(
			'postType',
			'wp_navigation',
			id as number | string,
			{ throwOnError: true }
		);
	} catch ( error ) {
		await writeMenuItems( id, previous );

		throw error;
	}
};

/** Whether an item's label still follows the page's title rather than the user's. */
const followsPage = ( item: NavigationBlock, previousLabel?: string ) =>
	! previousLabel || normalizeLabel( item.attributes?.label ) === normalizeLabel( previousLabel );

/** Appends an item for a newly created page to the site's menu. */
export async function addNavigationItem( item: NavigationItem ): Promise< void > {
	const menuId = getMenuIdForNewPage();

	if ( ! menuId ) {
		return;
	}

	const menu = await readMenu( menuId );

	if ( ! menu ) {
		return;
	}

	const previous = getItems( menu );

	await writeMenuItems( menuId, [
		...previous,
		createBlock( NAVIGATION_LINK_BLOCK, {
			label: item.label,
			id: item.id,
			url: item.url,
			type: item.type ?? 'page',
			kind: item.kind ?? 'post-type',
		} ),
	] );

	await saveMenu( menuId, previous );
}

/**
 * Rewrites every menu that holds the page.
 *
 * `rewrite` returns the new items, or `null` for a menu the page is not in.
 * Every menu, not just the first: a page linked from the header and the footer
 * would otherwise keep a stale link in one of them.
 *
 * `save` persists the write. A removal needs it, since the page it follows is
 * already deleted; a rename must not, since it saves with the page edit that
 * triggered it.
 */
async function rewriteMenusHolding(
	rewrite: ( items: NavigationBlock[] ) => NavigationBlock[] | null,
	save = false
): Promise< void > {
	for ( const menuId of getMenuIds() ) {
		const menu = await readMenu( menuId );

		if ( ! menu ) {
			continue;
		}

		const previous = getItems( menu );
		const rewritten = rewrite( previous );

		if ( ! rewritten ) {
			continue;
		}

		await writeMenuItems( menuId, rewritten );

		if ( save ) {
			await saveMenu( menuId, previous );
		}
	}
}

/**
 * The menus currently holding an item for this page.
 *
 * A rename overwrites that item's label, which may be one the user chose, so a
 * caller about to rename can snapshot these menus first and have the undo put
 * the exact label back rather than the page's old title.
 */
export async function getMenuIdsHolding(
	pageId: number | string,
	previousLabel?: string
): Promise< ( number | string )[] > {
	const matches = matchesPage( pageId, previousLabel );
	const holding: ( number | string )[] = [];

	for ( const menuId of getMenuIds() ) {
		const menu = await readMenu( menuId );

		if ( menu && someItem( getItems( menu ), matches ) ) {
			holding.push( menuId as number | string );
		}
	}

	return holding;
}

/** Relabels a page's menu item. */
export async function renameNavigationItem(
	pageId: number | string,
	label: string,
	previousLabel?: string
): Promise< void > {
	const matches = matchesPage( pageId, previousLabel );

	await rewriteMenusHolding( ( items ) => {
		let matched = false;

		const renamed = mapItems( items, ( item ) => {
			// Matched by id, but relabelled only where the label still follows the
			// page. One that no longer does is the user's, and a page rename is
			// not ours to overwrite it with — the same rule `matchesPage()` already
			// applies to items carrying no id.
			if ( ! matches( item ) || ! followsPage( item, previousLabel ) ) {
				return item;
			}

			matched = true;

			return { ...item, attributes: { ...item.attributes, label } };
		} );

		return matched ? renamed : null;
	} );
}

/**
 * Removes a deleted page's menu item, wherever it sits. Submenus included: an
 * item left behind there points at a page that no longer exists.
 */
export async function removeNavigationItem( pageId: number | string ): Promise< void > {
	const matches = matchesPage( pageId );

	await rewriteMenusHolding( ( items ) => {
		let removed = false;

		const remaining = rejectItems( items, ( item ) => {
			if ( ! matches( item ) ) {
				return false;
			}

			removed = true;

			return true;
		} );

		// Counted, not measured by length: a nested removal leaves the top
		// level the same size.
		return removed ? remaining : null;
	}, true );
}
