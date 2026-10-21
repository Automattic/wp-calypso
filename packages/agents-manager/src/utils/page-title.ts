import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect } from '@wordpress/data';
import { flattenTitle } from './entity-title';

/**
 * A page's title, read and written through core-data.
 *
 * `edit-entity-record` needs the title and url a page had before a rename or
 * deletion, to find its menu item and snapshot the change. The checkpoint
 * engine puts that title back on restore.
 */

interface PageRecord {
	title?: unknown;
	link?: unknown;
}

interface CoreResolve {
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id: number | string
	) => Promise< PageRecord | null >;
	getEntityRecord: (
		kind: string,
		name: string,
		id: number | string
	) => Promise< PageRecord | null >;
}

interface CoreDispatch {
	editEntityRecord: (
		kind: string,
		name: string,
		id: number | string,
		edits: Record< string, unknown >,
		options: { undoIgnore: boolean }
	) => Promise< unknown >;
}

/**
 * The page as core-data holds it, refusing one that cannot be read: an untitled
 * page and a page that no longer exists both read as `''`, and only one of them
 * can be renamed.
 */
async function readPage( pageId: number | string ): Promise< PageRecord > {
	const coreResolve = resolveSelect( coreStore ) as unknown as CoreResolve | undefined;
	const page = await coreResolve?.getEditedEntityRecord( 'postType', 'page', pageId );

	if ( ! page ) {
		throw new Error( `Page ${ pageId } could not be read; it may have been deleted.` );
	}

	return page;
}

/** The page's current title, or `''` when it has none. */
export async function getPageTitle( pageId: number | string ): Promise< string > {
	const page = await readPage( pageId );

	return flattenTitle( page.title );
}

/**
 * The title as last saved. A menu label follows this one until the page's
 * own edit is saved, so it is matched alongside the title on screen.
 */
export async function getSavedPageTitle( pageId: number | string ): Promise< string > {
	const coreResolve = resolveSelect( coreStore ) as unknown as CoreResolve | undefined;
	const page = await coreResolve?.getEntityRecord( 'postType', 'page', pageId );

	return flattenTitle( page?.title );
}

/** The page's permalink, or `undefined` when the record carries none. */
export async function getPageUrl( pageId: number | string ): Promise< string | undefined > {
	const page = await readPage( pageId );

	return typeof page.link === 'string' ? page.link : undefined;
}

/** Renames the page, outside the editor's undo stack. */
export async function setPageTitle( pageId: number | string, title: string ): Promise< void > {
	await readPage( pageId );

	const coreDispatch = dispatch( coreStore ) as unknown as CoreDispatch | undefined;

	if ( ! coreDispatch ) {
		throw new Error( 'The page is unavailable to edit.' );
	}

	await coreDispatch.editEntityRecord(
		'postType',
		'page',
		pageId,
		{ title },
		{ undoIgnore: true }
	);
}
