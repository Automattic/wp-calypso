/**
 * Reads and writes the page's blocks under their root: the site editor's
 * section container, the `core/post-content` block where a template wraps the
 * page, or the document root of a plain post editor.
 */

import { dispatch, select } from '@wordpress/data';
import { unlock } from './private-apis';

export type BlockAttributes = Record< string, unknown >;

export interface EditorBlock {
	clientId: string;
	name: string;
	attributes: BlockAttributes;
	innerBlocks: EditorBlock[];
}

/** The blocks of one template part, which the editor keeps apart from the tree. */
export interface TemplatePartBlocks {
	slug: string;
	blocks: EditorBlock[];
}

/** Every block the page holds: its root's, and those of each template part. */
export interface PageBlocks {
	blocks: EditorBlock[];
	templateParts: TemplatePartBlocks[];
}

export interface CurrentPost {
	id: number | string;
	type: string;
	title?: string;
}

export interface BlocksRoot {
	kind: 'section' | 'post-content' | 'document';
	clientId: string;
	post: CurrentPost;
}

/** Stands in for the document root, which has no block of its own. */
export const DOCUMENT_ROOT_CLIENT_ID = '__agents-manager-document-root__';

interface BlockEditorSelect {
	areInnerBlocksControlled?: ( clientId: string ) => boolean;
	getBlock?: ( clientId: string ) => EditorBlock | null;
	getBlocks: ( rootClientId?: string ) => EditorBlock[];
	getBlocksByName?: ( name: string ) => string[];
	getClientIdsWithDescendants?: () => string[];
	getBlockName?: ( clientId: string ) => string | null;
	getBlockParents?: ( clientId: string ) => string[];
	getBlockRootClientId?: ( clientId: string ) => string | null;
	getSelectedBlockClientId?: () => string | null;
	getSectionRootClientId?: () => string | undefined;
	getSettings?: () => { colors?: { slug: string; color: string }[] };
}

interface BlockEditorDispatch {
	insertBlock: (
		block: EditorBlock,
		index: number | undefined,
		rootClientId: string | undefined,
		updateSelection: boolean
	) => void;
	removeBlock: ( clientId: string, selectPrevious: boolean ) => void;
	replaceBlock: ( clientId: string, block: EditorBlock ) => void;
	replaceInnerBlocks: (
		rootClientId: string,
		blocks: EditorBlock[],
		updateSelection: boolean
	) => void;
	resetBlocks: ( blocks: EditorBlock[] ) => void;
	updateBlockAttributes: ( clientId: string, attributes: BlockAttributes ) => void;
	clearSelectedBlock: () => void;
	__unstableMarkNextChangeAsNotPersistent: ( options?: { history?: 'ignore' } ) => void;
	__unstableMarkLastChangeAsPersistent: () => void;
}

// Resolved by name to keep `@wordpress/block-editor` out of this module.
const blockEditorSelect = () =>
	select( 'core/block-editor' ) as unknown as BlockEditorSelect | undefined;
const blockEditorDispatch = () =>
	dispatch( 'core/block-editor' ) as unknown as BlockEditorDispatch | undefined;

/** The blocks under `rootClientId`, or the document's own without one. */
export const getBlocks = ( rootClientId?: string ): EditorBlock[] =>
	blockEditorSelect()?.getBlocks( rootClientId ) ?? [];

export const getBlock = ( clientId: string ): EditorBlock | undefined =>
	blockEditorSelect()?.getBlock?.( clientId ) ?? undefined;

/** The clientIds of every `name` block, at any depth. */
export const getBlocksByName = ( name: string ): string[] =>
	blockEditorSelect()?.getBlocksByName?.( name ) ?? [];

/** The names of the block types in the editor, at any depth. */
export function getBlockNames(): Set< string > {
	const blockEditor = blockEditorSelect();
	const clientIds = blockEditor?.getClientIdsWithDescendants?.() ?? [];

	return new Set(
		clientIds
			.map( ( clientId ) => blockEditor?.getBlockName?.( clientId ) )
			.filter( ( name ): name is string => !! name )
	);
}

/** The ancestors of `clientId`, outermost first. */
export const getBlockParents = ( clientId: string ): string[] =>
	blockEditorSelect()?.getBlockParents?.( clientId ) ?? [];

/** The parent of `clientId`, or `undefined` for a block at the document root. */
export const getBlockRootClientId = ( clientId: string ): string | undefined =>
	blockEditorSelect()?.getBlockRootClientId?.( clientId ) || undefined;

export const getSelectedBlockClientId = (): string | undefined =>
	blockEditorSelect()?.getSelectedBlockClientId?.() ?? undefined;

/** The colour a palette slug stands for, or `undefined` when the palette lacks it. */
export const getPaletteColor = ( slug: string ): string | undefined =>
	blockEditorSelect()
		?.getSettings?.()
		.colors?.find( ( entry ) => entry.slug === slug )?.color;

/** The post the editor holds, or `undefined` while it is still loading. */
export function getCurrentPost(): CurrentPost | undefined {
	const editor = select( 'core/editor' ) as unknown as
		| {
				getCurrentPostId?: () => number | string | undefined;
				getCurrentPostType?: () => string;
				getEditedPostAttribute?: ( attribute: string ) => unknown;
		  }
		| undefined;
	const id = editor?.getCurrentPostId?.();
	const type = editor?.getCurrentPostType?.();
	const title = editor?.getEditedPostAttribute?.( 'title' );

	if ( ! id || ! type ) {
		return undefined;
	}

	return { id, type, ...( typeof title === 'string' && title && { title } ) };
}

/** Behind the private API: the container the site editor's own tools write into. */
export function getSectionRootClientId(): string | undefined {
	const blockEditor = blockEditorSelect();

	if ( ! blockEditor || ! unlock ) {
		return undefined;
	}

	try {
		return unlock< BlockEditorSelect >( blockEditor ).getSectionRootClientId?.() || undefined;
	} catch {
		return undefined;
	}
}

export const POST_CONTENT_BLOCK = 'core/post-content';

/** The first `core/post-content` block, at any depth. */
export const findPostContentClientId = (): string | undefined =>
	getBlocksByName( POST_CONTENT_BLOCK )[ 0 ];

/**
 * Where the page's blocks live, or `null` while the editor is still loading.
 * Nothing counts until the editor holds a post: a stream that arrives early
 * waits instead of writing into nothing, and a snapshot always names its page.
 */
export function resolveBlocksRoot(): BlocksRoot | null {
	const post = getCurrentPost();

	if ( ! post ) {
		return null;
	}

	const section = getSectionRootClientId();

	if ( section ) {
		return { kind: 'section', clientId: section, post };
	}

	const postContent = findPostContentClientId();

	return postContent
		? { kind: 'post-content', clientId: postContent, post }
		: { kind: 'document', clientId: DOCUMENT_ROOT_CLIENT_ID, post };
}

/** The blocks of a `BlocksRoot`, whose `clientId` may stand in for the document root. */
export const getRootBlocks = ( clientId: string ): EditorBlock[] =>
	getBlocks( clientId === DOCUMENT_ROOT_CLIENT_ID ? undefined : clientId );

export const TEMPLATE_PART_BLOCK = 'core/template-part';

/** The template parts on the page, by slug, in tree order. */
export const getTemplatePartClientIds = (): { slug: string; clientId: string }[] =>
	getBlocksByName( TEMPLATE_PART_BLOCK ).flatMap( ( clientId ) => {
		const slug = getBlock( clientId )?.attributes.slug;

		return typeof slug === 'string' && slug ? [ { slug, clientId } ] : [];
	} );

/** The blocks of every template part on the page, by slug. */
export const getTemplatePartBlocks = (): TemplatePartBlocks[] =>
	getTemplatePartClientIds().map( ( { slug, clientId } ) => ( {
		slug,
		blocks: getBlocks( clientId ),
	} ) );

/** The template part with `slug`, or `undefined` when the page shows none. */
export const findTemplatePartClientId = ( slug: string ): string | undefined =>
	getTemplatePartClientIds().find( ( part ) => part.slug === slug )?.clientId;

/** The page as the editor holds it now: the root's blocks and each template part's. */
export const getPageBlocks = (): PageBlocks => ( {
	blocks: getRootBlocks( resolveBlocksRoot()?.clientId ?? DOCUMENT_ROOT_CLIENT_ID ),
	templateParts: getTemplatePartBlocks(),
} );

function requireBlockEditor(): BlockEditorDispatch {
	const blockEditor = blockEditorDispatch();

	if ( ! blockEditor ) {
		throw new Error( 'The editor is unavailable to write blocks.' );
	}

	return blockEditor;
}

/** Inserts `block` under `rootClientId`, or at the document root without one. */
export function insertBlock( block: EditorBlock, index?: number, rootClientId?: string ): void {
	requireBlockEditor().insertBlock( block, index, rootClientId, false );
}

export function removeBlock( clientId: string ): void {
	requireBlockEditor().removeBlock( clientId, false );
}

export function replaceBlock( clientId: string, block: EditorBlock ): void {
	requireBlockEditor().replaceBlock( clientId, block );
}

export function replaceInnerBlocks( clientId: string, blocks: EditorBlock[] ): void {
	requireBlockEditor().replaceInnerBlocks( clientId, blocks, false );
}

export function updateBlockAttributes( clientId: string, attributes: BlockAttributes ): void {
	requireBlockEditor().updateBlockAttributes( clientId, attributes );
}

/** The block list a write changes, by its parent: `undefined` for the document's own. */
export type WrittenList< Args extends unknown[] > = ( ...args: Args ) => string | undefined;

export interface UndoLevel {
	/** Wraps a write so that it lands in this level. */
	write: < Args extends unknown[] >(
		write: ( ...args: Args ) => void,
		writtenList: WrittenList< Args >,
		/** The block the write recreates under new clientIds, children and all. */
		recreated?: ( ...args: Args ) => string
	) => ( ...args: Args ) => void;
	/** Folds the writes into one undo record; nothing to fold is a no-op. */
	close: () => void;
	hasWritten: () => boolean;
}

/**
 * The block whose inner blocks sync to their own record and hold `clientId`'s
 * list, such as a template part or a post's content, or `''` for the
 * document root.
 */
function getSyncedRoot( clientId: string | undefined ): string {
	const blockEditor = blockEditorSelect();

	if ( ! clientId ) {
		return '';
	}

	return (
		[ ...getBlockParents( clientId ), clientId ]
			.reverse()
			.find( ( id ) => blockEditor?.areInnerBlocksControlled?.( id ) ) ?? ''
	);
}

const isSamePost = ( a?: CurrentPost, b?: CurrentPost ): boolean =>
	!! a && !! b && a.id === b.id && a.type === b.type;

/**
 * Block writes that undo as one level. The first write commits whatever the
 * user was typing, so that stays its own level, and opens this one; every
 * later write stays out of the undo stack until `close()` folds it in.
 *
 * Marking the last change as persistent is not enough to fold them: a
 * record's `useBlockSync` commits on that mark only when the notification
 * right before it changed its blocks, so any other notification in between
 * (a selection, a write to another record) leaves the writes as transient
 * edits that are neither saved nor undoable (WPAGENT-201). `close()` instead
 * rewrites each record's blocks as they are, a real persistent change.
 *
 * A write that recreates a block takes the records inside it to new
 * clientIds, which `close()` cannot find: those are committed before it.
 */
export function openUndoLevel(): UndoLevel {
	const post = getCurrentPost();
	const stagedRoots = new Set< string >();
	let hasWritten = false;

	// `replaceInnerBlocks` on `''` keeps the records nested in the document,
	// where `resetBlocks` would rebuild and dirty them.
	const commit = ( root: string ) =>
		requireBlockEditor().replaceInnerBlocks( root, getBlocks( root ), false );

	return {
		write:
			( write, writtenList, recreated ) =>
			( ...args ) => {
				if ( hasWritten ) {
					const recreatedId = recreated?.( ...args );

					if ( recreatedId ) {
						stagedRoots.forEach( ( root ) => {
							if ( root === recreatedId || getBlockParents( root ).includes( recreatedId ) ) {
								commit( root );
								stagedRoots.delete( root );
							}
						} );
					}

					stagedRoots.add( getSyncedRoot( writtenList( ...args ) ) );
					requireBlockEditor().__unstableMarkNextChangeAsNotPersistent();
				} else {
					requireBlockEditor().__unstableMarkLastChangeAsPersistent();
					hasWritten = true;
				}

				write( ...args );
			},
		close: () => {
			if ( ! hasWritten ) {
				return;
			}

			// After a move the editor holds another page, which nothing here wrote.
			if ( isSamePost( post, getCurrentPost() ) ) {
				stagedRoots.forEach( ( root ) => {
					if ( ! root || getBlock( root ) ) {
						commit( root );
					}
				} );
			}

			requireBlockEditor().__unstableMarkLastChangeAsPersistent();
		},
		hasWritten: () => hasWritten,
	};
}

/** Replaces the blocks of `clientId`, recording an undo level. */
export function replaceRootBlocks( clientId: string, blocks: EditorBlock[] ): void {
	if ( clientId === DOCUMENT_ROOT_CLIENT_ID ) {
		requireBlockEditor().resetBlocks( blocks );
	} else {
		replaceInnerBlocks( clientId, blocks );
	}
}

type Batch = ( run: () => void ) => void;

const runNow: Batch = ( run ) => run();

/**
 * Replaces the blocks of `clientId` outside the undo stack: `history: 'ignore'`
 * syncs the write with `undoIgnore`, so no undo record is left. `batch` keeps
 * the mark and the write in one store notification, so no subscriber consumes
 * the mark in between.
 */
export function stageRootBlocks(
	clientId: string,
	blocks: EditorBlock[],
	batch: Batch = runNow
): void {
	batch( () => {
		blockEditorDispatch()?.__unstableMarkNextChangeAsNotPersistent( { history: 'ignore' } );
		replaceRootBlocks( clientId, blocks );
	} );
}

export function clearBlockSelection(): void {
	blockEditorDispatch()?.clearSelectedBlock();
}
