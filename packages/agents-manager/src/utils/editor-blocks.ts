/**
 * Reads and writes the page's blocks under their root: the site editor's
 * section container, the `core/post-content` block where a template wraps the
 * page, or the document root of a plain post editor.
 */

import { dispatch, select } from '@wordpress/data';
import { unlock } from './private-apis';

export interface EditorBlock {
	clientId: string;
	name: string;
	attributes: Record< string, unknown >;
	innerBlocks: EditorBlock[];
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
	getBlocks: ( rootClientId?: string ) => EditorBlock[];
	getBlocksByName?: ( name: string ) => string[];
	getSectionRootClientId?: () => string | undefined;
}

interface BlockEditorDispatch {
	replaceInnerBlocks: (
		rootClientId: string,
		blocks: EditorBlock[],
		updateSelection: boolean
	) => void;
	resetBlocks: ( blocks: EditorBlock[] ) => void;
	clearSelectedBlock: () => void;
	__unstableMarkNextChangeAsNotPersistent: ( options?: { history?: 'ignore' } ) => void;
}

// Resolved by name to keep `@wordpress/block-editor` out of this module.
const blockEditorSelect = () =>
	select( 'core/block-editor' ) as unknown as BlockEditorSelect | undefined;
const blockEditorDispatch = () =>
	dispatch( 'core/block-editor' ) as unknown as BlockEditorDispatch | undefined;

const getBlocks = ( rootClientId?: string ): EditorBlock[] =>
	blockEditorSelect()?.getBlocks( rootClientId ) ?? [];

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

// Behind the private API: the container the site editor's own tools write into.
function getSectionRootClientId(): string | undefined {
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
	blockEditorSelect()?.getBlocksByName?.( 'core/post-content' )[ 0 ];

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

export const getRootBlocks = ( clientId: string ): EditorBlock[] =>
	getBlocks( clientId === DOCUMENT_ROOT_CLIENT_ID ? undefined : clientId );

/** Replaces the blocks of `clientId`, recording an undo level. */
export function replaceRootBlocks( clientId: string, blocks: EditorBlock[] ): void {
	const blockEditor = blockEditorDispatch();

	if ( ! blockEditor ) {
		throw new Error( 'The editor is unavailable to write blocks.' );
	}

	if ( clientId === DOCUMENT_ROOT_CLIENT_ID ) {
		blockEditor.resetBlocks( blocks );
	} else {
		blockEditor.replaceInnerBlocks( clientId, blocks, false );
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
