import { createBlock, parse, serialize } from '@wordpress/blocks';
import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect, select } from '@wordpress/data';
import { sameUrl } from './same-url';
import { getSiteMetadata } from './site-metadata';
import type { Block } from '@wordpress/blocks';

/**
 * The site's navigation menu, as `edit-entity-record` needs to touch it: a
 * page added to the site gets a menu item, a renamed page renames its item,
 * and a deleted page loses it.
 *
 * The menu is a `wp_navigation` entity whose blocks are the items. Whether a
 * write saves at once or joins the page edit's unsaved changes is decided in
 * `saveMenu()`.
 */

/** A menu item: `core/navigation-link`, or a submenu holding more of them. */
export type NavigationBlock = Block< Record< string, unknown > >;

/** A menu's post id, as block attributes and site metadata carry it. */
export type MenuId = number | string;

const isMenuId = ( value: unknown ): value is MenuId =>
	( typeof value === 'number' || typeof value === 'string' ) && !! value;

/** Ids arrive from block attributes and from metadata, so a `19` can meet a `'19'`. */
export const isSameMenuId = ( a: MenuId, b: MenuId ): boolean => String( a ) === String( b );

interface NavigationRecord {
	id?: number | string;
	blocks?: NavigationBlock[];
	content?: unknown;
}

export interface NavigationItem {
	label: string;
	id: number | string;
	url?: string;
	/** The page's parent, for a Page List scoped to one. */
	parent?: number;
}

const NAVIGATION_BLOCK = 'core/navigation';
export const NAVIGATION_LINK_BLOCK = 'core/navigation-link';
export const NAVIGATION_SUBMENU_BLOCK = 'core/navigation-submenu';
const PAGE_LIST_BLOCK = 'core/page-list';

/**
 * The fields that hold the items: `content` is what persists, `blocks` what the
 * editor reads. They are written and saved together, and nothing else on the
 * record — a title, a status — is touched.
 */
export const MENU_FIELDS = [ 'blocks', 'content' ];

// Resolved by name to keep `@wordpress/block-editor` out of this module.
const BLOCK_EDITOR_STORE = 'core/block-editor';

interface BlockEditorSelect {
	getBlocksByName?: ( name: string ) => string[];
	getBlock?: ( clientId: string ) => { attributes?: { ref?: unknown } } | null;
}

interface CoreResolve {
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id?: MenuId
	) => Promise< NavigationRecord | null >;
	getEntityRecords: (
		kind: string,
		name: string,
		query: Record< string, unknown >
	) => Promise< NavigationRecord[] | null >;
}

interface CoreDispatch {
	editEntityRecord: (
		kind: string,
		name: string,
		id: MenuId,
		edits: Record< string, unknown >,
		options: { undoIgnore: boolean }
	) => Promise< unknown >;
	__experimentalSaveSpecifiedEntityEdits: (
		kind: string,
		name: string,
		id: MenuId,
		fields: string[],
		options: { throwOnError: boolean }
	) => Promise< unknown >;
}

const coreResolve = () => resolveSelect( coreStore ) as unknown as CoreResolve;

const normalizeLabel = ( label: unknown ) =>
	String( label ?? '' )
		.trim()
		.toLocaleLowerCase();

const isMenuItem = ( item: NavigationBlock ) =>
	item.name === NAVIGATION_LINK_BLOCK || item.name === NAVIGATION_SUBMENU_BLOCK;

/**
 * A record's items: its blocks once the editor has touched it, otherwise parsed
 * from its serialized content. An empty `blocks` is a cleared menu, not an
 * unedited one, so any array is taken as it is.
 */
const getItems = ( record: NavigationRecord ): NavigationBlock[] => {
	if ( Array.isArray( record.blocks ) ) {
		return record.blocks;
	}

	const content = record.content;
	const serialized =
		typeof content === 'string' ? content : ( content as { raw?: string } )?.raw ?? '';

	return serialized ? ( parse( serialized ) as NavigationBlock[] ) : [];
};

/**
 * The menus rendered by the open view: listed first by `getMenuIds()`, and the
 * fallback for a site whose metadata names no menu.
 */
export function getRenderedMenuIds(): MenuId[] {
	const blockEditor = select( BLOCK_EDITOR_STORE ) as unknown as BlockEditorSelect | undefined;

	return [
		...new Set(
			( blockEditor?.getBlocksByName?.( NAVIGATION_BLOCK ) ?? [] )
				.map( ( clientId ) => blockEditor?.getBlock?.( clientId )?.attributes?.ref )
				.filter( isMenuId )
		),
	];
}

/**
 * Every menu the site has, the rendered ones first, then the one site metadata
 * names, then the rest. A menu off screen still holds its links, so a page
 * rename or deletion has to reach it too.
 */
async function getMenuIds(): Promise< MenuId[] > {
	const records =
		( await coreResolve().getEntityRecords( 'postType', 'wp_navigation', {
			per_page: -1,
			status: [ 'publish', 'draft' ],
		} ) ) ?? [];
	const ids = [ ...getRenderedMenuIds() ];

	for ( const id of [ getSiteMetadata()?.navigationId, ...records.map( ( r ) => r.id ) ] ) {
		if ( isMenuId( id ) && ! ids.some( ( known ) => isSameMenuId( known, id ) ) ) {
			ids.push( id );
		}
	}

	return ids;
}

const readMenu = async ( id: MenuId ): Promise< NavigationRecord | null > =>
	( await coreResolve().getEditedEntityRecord( 'postType', 'wp_navigation', id ) ) || null;

export const writeMenuItems = async ( id: MenuId, items: NavigationBlock[] ): Promise< void > => {
	const coreDispatch = dispatch( coreStore ) as unknown as CoreDispatch | undefined;

	if ( ! coreDispatch ) {
		throw new Error( 'The navigation menu is unavailable to edit.' );
	}

	await coreDispatch.editEntityRecord(
		'postType',
		'wp_navigation',
		id,
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
export async function readMenuItems( id: MenuId ): Promise< NavigationBlock[] | null > {
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
 * Drops every item matching `matches`, however deeply nested. A dropped
 * parent's children move up to take its place: they point at pages that
 * still exist.
 *
 * A submenu that loses its last child becomes a plain link again: the block
 * type is what draws the dropdown arrow, so leaving it as a submenu shows a
 * chevron on an item with nothing to open.
 */
const rejectItems = (
	items: NavigationBlock[],
	matches: ( item: NavigationBlock ) => boolean
): NavigationBlock[] =>
	items.flatMap( ( item ) => {
		const innerBlocks = item.innerBlocks?.length ? rejectItems( item.innerBlocks, matches ) : [];

		if ( matches( item ) ) {
			return innerBlocks;
		}

		if ( ! item.innerBlocks?.length ) {
			return [ item ];
		}

		const emptied = ! innerBlocks.length && item.name === NAVIGATION_SUBMENU_BLOCK;

		return [ { ...item, innerBlocks, ...( emptied && { name: NAVIGATION_LINK_BLOCK } ) } ];
	} );

/**
 * Whether a menu item points at `pageId`.
 *
 * Identification only. An item carrying no id is matched by its url — a
 * custom label does not make it another link, and a label alone names nothing,
 * since an unlinked submenu can share the page's name. Whether a matched item
 * may then be *relabelled* is `followsPage()`.
 */
const matchesPage = ( pageId: number | string, pageUrl?: string ) => ( item: NavigationBlock ) => {
	if ( ! isMenuItem( item ) ) {
		return false;
	}

	const { id: itemId, type, url } = item.attributes ?? {};

	// An id is only unique within a kind — a category can carry the same
	// number as a page — so it counts on a page link alone.
	if ( itemId ) {
		return ( type ?? 'page' ) === 'page' && String( itemId ) === String( pageId );
	}

	return !! url && !! pageUrl && sameUrl( url, pageUrl );
};

/**
 * Whether an item's label still follows the page rather than the user.
 *
 * A page rename may overwrite a label that tracked the page's title; one the
 * user has since chosen is theirs to keep. Applied whether or not the item
 * carries an id, so the same label is treated the same way either way. Only
 * unknown previous titles skip the check — an empty one is a title too.
 */
const followsPage = ( item: NavigationBlock, previousLabels?: string[] ) =>
	previousLabels === undefined ||
	previousLabels.some(
		( previous ) => normalizeLabel( item.attributes?.label ) === normalizeLabel( previous )
	);

/**
 * Persists a menu's items, putting `previous` back if the save fails.
 *
 * A menu write following a page *edit* is left unsaved on purpose: the two join
 * one unsaved-changes set and save together. One following a creation or
 * deletion has no such partner, and a reload would throw it away while the page
 * stands.
 *
 * Only the item fields are saved, so a title or status edit the user left
 * pending stays theirs. The write is applied locally with `undoIgnore`, so a
 * refused save would strand it with no undo at all. Errors are suppressed by
 * default, which would report a menu change that never reached the server as a
 * success.
 */
const saveMenu = async ( id: MenuId, previous: NavigationBlock[] ): Promise< void > => {
	const coreDispatch = dispatch( coreStore ) as unknown as CoreDispatch | undefined;

	try {
		// Refused, not skipped: a save that silently never ran would report a
		// menu change that the next reload throws away.
		if ( ! coreDispatch?.__experimentalSaveSpecifiedEntityEdits ) {
			throw new Error( 'The navigation menu is unavailable to save.' );
		}

		await coreDispatch.__experimentalSaveSpecifiedEntityEdits(
			'postType',
			'wp_navigation',
			id,
			MENU_FIELDS,
			{ throwOnError: true }
		);
	} catch ( error ) {
		await writeMenuItems( id, previous );

		throw error;
	}
};

/** Whether a Page List block lists the page: every page, or its parent's children. */
const listsPage =
	( parent = 0 ) =>
	( block: NavigationBlock ): boolean =>
		block.name === PAGE_LIST_BLOCK &&
		[ 0, parent ].includes( Number( block.attributes.parentPageID ?? 0 ) );

/**
 * Appends an item for a newly created page to the site's menu, unless a Page
 * List block there shows the page already.
 */
export async function addNavigationItem( item: NavigationItem ): Promise< void > {
	// Resolved first: an unread site record would read as a site naming no
	// menu, and the page would land in whichever menu renders first.
	await coreResolve().getEditedEntityRecord( 'root', 'site' );

	const metadata = getSiteMetadata();

	if ( ! metadata ) {
		throw new Error(
			'The site settings could not be read, so the menu for the new page is unknown.'
		);
	}

	// The menu the site names, not the first rendered one: that list holds
	// header and footer alike. A rendered menu is the fallback for a site that
	// names none.
	const menuId = isMenuId( metadata.navigationId )
		? metadata.navigationId
		: getRenderedMenuIds()[ 0 ];

	if ( ! menuId ) {
		return;
	}

	const menu = await readMenu( menuId );

	// The site named this menu, so nothing to read is a failure to report — a
	// silent return would call the page created and its item never added.
	if ( ! menu ) {
		throw new Error( `Navigation menu not found: ${ menuId }` );
	}

	const previous = getItems( menu );

	if ( someItem( previous, listsPage( item.parent ) ) ) {
		return;
	}

	await writeMenuItems( menuId, [
		...previous,
		createBlock( NAVIGATION_LINK_BLOCK, {
			label: item.label,
			id: item.id,
			url: item.url,
			type: 'page',
			kind: 'post-type',
		} ),
	] );

	await saveMenu( menuId, previous );
}

/**
 * Rewrites every menu that holds the page. `rewrite` returns the new items, or
 * `null` for a menu the page is not in.
 *
 * Every menu, not just the first: a page linked from the header and the footer
 * would otherwise keep a stale link in one. All are read before any is written,
 * so one that cannot be read costs nothing, where a write already made would
 * leave the menus disagreeing. The page change this follows has landed, so a
 * retry could not finish the job.
 *
 * `save` persists the writes. A removal needs it, since its page is already
 * deleted; a rename does not, since it saves with the page edit.
 */
async function rewriteMenusHolding(
	rewrite: ( items: NavigationBlock[] ) => NavigationBlock[] | null,
	save = false
): Promise< void > {
	const rewrites: { menuId: MenuId; previous: NavigationBlock[]; items: NavigationBlock[] }[] = [];

	for ( const menuId of await getMenuIds() ) {
		const menu = await readMenu( menuId );

		// Only a rendered `ref` pointing at a deleted menu reads as nothing;
		// there is no link left there to keep in step.
		if ( ! menu ) {
			continue;
		}

		const previous = getItems( menu );
		const items = rewrite( previous );

		if ( items ) {
			rewrites.push( { menuId, previous, items } );
		}
	}

	for ( const { menuId, items } of rewrites ) {
		await writeMenuItems( menuId, items );
	}

	if ( ! save ) {
		return;
	}

	// Every menu gets its save, whatever the others do: the page change is
	// already persisted, so each menu saved is one fewer left disagreeing with
	// it. A menu whose save failed has its items put back, and is named.
	const saves = await Promise.allSettled(
		rewrites.map( ( { menuId, previous } ) => saveMenu( menuId, previous ) )
	);
	const failed = rewrites.filter( ( _rewrite, i ) => saves[ i ].status === 'rejected' );

	if ( failed.length ) {
		const reason = ( saves.find( ( s ) => s.status === 'rejected' ) as PromiseRejectedResult )
			.reason;

		throw new Error(
			`Could not save menu ${ failed.map( ( { menuId } ) => menuId ).join( ', ' ) }: ${
				( reason as Error )?.message ?? String( reason )
			}. Its items were put back; every other menu was saved.`
		);
	}
}

/**
 * The menus a rename of this page will relabel, so the caller can snapshot
 * them first. Only those: a snapshot of a menu the rename leaves alone would
 * let a later undo overwrite whatever the user changed there since.
 */
export async function getMenuIdsToRelabel(
	pageId: number | string,
	previousLabels?: string[],
	pageUrl?: string
): Promise< MenuId[] > {
	const matches = matchesPage( pageId, pageUrl );
	const relabels = ( item: NavigationBlock ) =>
		matches( item ) && followsPage( item, previousLabels );
	const ids: MenuId[] = [];

	for ( const menuId of await getMenuIds() ) {
		const menu = await readMenu( menuId );

		if ( menu && someItem( getItems( menu ), relabels ) ) {
			ids.push( menuId );
		}
	}

	return ids;
}

/**
 * Relabels a page's menu item. `previousLabels` are the titles the page had,
 * on screen and saved: an item whose label still follows one of them is
 * relabelled, one the user renamed by hand is left alone.
 */
export async function renameNavigationItem(
	pageId: number | string,
	label: string,
	previousLabels?: string[],
	pageUrl?: string
): Promise< void > {
	const matches = matchesPage( pageId, pageUrl );

	await rewriteMenusHolding( ( items ) => {
		let matched = false;

		const renamed = mapItems( items, ( item ) => {
			// Matched by id or url, but relabelled only where the label still
			// follows the page: one the user has since renamed is theirs.
			if ( ! matches( item ) || ! followsPage( item, previousLabels ) ) {
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
 *
 * `pageUrl` is the page's permalink before the delete, which is how an item
 * carrying no page id is matched.
 */
export async function removeNavigationItem(
	pageId: number | string,
	pageUrl?: string
): Promise< void > {
	const matches = matchesPage( pageId, pageUrl );

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
