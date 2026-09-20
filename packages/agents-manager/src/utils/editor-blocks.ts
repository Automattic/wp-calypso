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
	getBlock?: ( clientId: string ) => EditorBlock | null;
	getBlocks: ( rootClientId?: string ) => EditorBlock[];
	getBlocksByName?: ( name: string ) => string[];
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
	updateBlockAttributes: ( clientId: string, attributes: Record< string, unknown > ) => void;
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

/** The first `core/post-content` block, at any depth. */
export const findPostContentClientId = (): string | undefined =>
	getBlocksByName( 'core/post-content' )[ 0 ];

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

export interface UndoLevel {
	/** Wraps a write so that it lands in this level. */
	write: < Args extends unknown[] >(
		write: ( ...args: Args ) => void
	) => ( ...args: Args ) => void;
	/** Folds the writes into one undo record; nothing to fold is a no-op. */
	close: () => void;
	hasWritten: () => boolean;
}

/**
 * Block writes that undo as one level. The first write commits whatever the
 * user was typing, so that stays its own level, and opens this one; every
 * later write stays out of the undo stack until `close()` folds it in.
 */
export function openUndoLevel(): UndoLevel {
	let hasWritten = false;

	return {
		write:
			( write ) =>
			( ...args ) => {
				if ( hasWritten ) {
					requireBlockEditor().__unstableMarkNextChangeAsNotPersistent();
				} else {
					requireBlockEditor().__unstableMarkLastChangeAsPersistent();
					hasWritten = true;
				}

				write( ...args );
			},
		close: () => {
			if ( hasWritten ) {
				requireBlockEditor().__unstableMarkLastChangeAsPersistent();
			}
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
