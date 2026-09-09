import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect } from '@wordpress/data';
import { flattenTitle } from './entity-title';

/**
 * A page's title, read and written through core-data.
 *
 * Shared by `edit-entity-record` — which needs the title a page had before a
 * rename, to relabel its menu item and to snapshot the change — and by the
 * checkpoint engine, which puts that title back on restore.
 */

interface PageRecord {
	title?: unknown;
}

interface CoreResolve {
	getEditedEntityRecord: (
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
