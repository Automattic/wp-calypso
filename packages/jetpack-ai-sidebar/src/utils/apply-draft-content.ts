/**
 * Client ability `jetpack-ai/apply-draft-content` — writes a generated first
 * draft into the post the user already has open.
 *
 * Cross-repo contract: the wpcom draft ability emits an `Input_Required_Result`
 * with `tool_id: 'jetpack_ai__apply_draft_content'` and the arguments below.
 * Agents Manager normalizes `jetpack-ai/apply-draft-content` →
 * `jetpack_ai__apply_draft_content`, so both spellings must be recognized —
 * same pattern as `wpcom/update-block-content` (see `tool-provider.ts`).
 *
 * The handler only ever writes into a genuinely empty post, of a post type
 * draft assist supports, and never over a title the user already typed.
 * Refusing is returned to the agent (`returnToAgent: true`) so it can tell the
 * user why nothing happened; a successful write is not (`returnToAgent: false`,
 * matching the other editor-mutating handlers in this package), with the
 * model's own `summary` surfaced as the chat message.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from '@wordpress/blocks';
import { isDraftAssistPostType } from './draft-assist';
import {
	type DraftAssistContentType,
	type DraftAssistRejectionReason,
	trackDraftAssistDraftApplied,
	trackDraftAssistDraftRejected,
} from './tracking';
import type { Tool } from '@automattic/agenttic-client';

/** Normalized tool id the orchestrator emits for this ability. */
export const APPLY_DRAFT_CONTENT_TOOL_ID = 'jetpack_ai__apply_draft_content';

/** Ability name registered with Agents Manager. */
export const APPLY_DRAFT_CONTENT_ABILITY_NAME = 'jetpack-ai/apply-draft-content';

export const APPLY_DRAFT_CONTENT_ABILITY: Tool = {
	id: APPLY_DRAFT_CONTENT_TOOL_ID,
	name: APPLY_DRAFT_CONTENT_ABILITY_NAME,
	...( { label: 'Apply draft content', category: 'jetpack-ai' } as any ),
	description:
		'Write a generated first draft into the post or page the user currently has open in the editor. Only works while that post is still empty; it never replaces existing content.',
	input_schema: {
		type: 'object',
		properties: {
			markup: {
				type: 'string',
				description: 'The draft as serialized Gutenberg block markup.',
			},
			contentType: {
				type: 'string',
				enum: [ 'post', 'page' ],
				description: 'Whether the draft is for a post or a page.',
			},
			summary: {
				type: 'string',
				description: 'A brief user-friendly description of the draft that was written.',
			},
			title: {
				type: 'string',
				description:
					'Optional: a title for the post. The existing title is left alone when this is omitted, and also whenever the post already has a title — the user typed that one.',
			},
		},
		required: [ 'markup', 'contentType', 'summary' ],
	},
};

/**
 * Whether a tool id addresses this ability, in either the raw or the
 * AM-normalized spelling.
 * @param toolId - Tool id from the orchestrator.
 * @returns Whether this provider owns the tool.
 */
export function isApplyDraftContentTool( toolId: string ): boolean {
	return toolId === APPLY_DRAFT_CONTENT_ABILITY_NAME || toolId === APPLY_DRAFT_CONTENT_TOOL_ID;
}

export interface ApplyDraftContentResult {
	success: boolean;
	error?: string;
	returnToAgent: boolean;
	agentMessage?: string;
	blockCount?: number;
	titleUpdated?: boolean;
	/**
	 * True when the model supplied a title but the post already had one, so the
	 * user's title was kept. Surfaced in the result so the agent can say so.
	 */
	titleSkipped?: boolean;
}

// Store access mirrors `block-actions.ts`: read through `window.wp.data` with
// try/catch guards, so a bundle loaded outside the editor degrades to a clean
// failure instead of throwing.
function getWpDataStore( kind: 'select' | 'dispatch', storeName: string ): any | null {
	try {
		const wpData = ( window as any ).wp?.data;
		if ( ! wpData?.[ kind ] ) {
			return null;
		}
		return wpData[ kind ]( storeName ) ?? null;
	} catch {
		return null;
	}
}

/**
 * Call a store selector without letting a throw escape this handler.
 * @param store  - Store object from `getWpDataStore`.
 * @param method - Selector name.
 * @param args   - Selector arguments.
 * @returns The selector's return value, or undefined if it is missing or threw.
 */
function selectSafely< T >( store: any, method: string, ...args: unknown[] ): T | undefined {
	try {
		const selector = store?.[ method ];
		return typeof selector === 'function' ? selector.apply( store, args ) : undefined;
	} catch {
		return undefined;
	}
}

function normalizeContentType( contentType: unknown ): DraftAssistContentType {
	return contentType === 'page' ? 'page' : 'post';
}

function reject(
	contentType: DraftAssistContentType,
	reason: DraftAssistRejectionReason,
	error: string
): ApplyDraftContentResult {
	trackDraftAssistDraftRejected( { contentType, reason } );
	// Hand the refusal back to the agent so it can explain it in chat.
	return { success: false, error, returnToAgent: true };
}

/**
 * Whether the post holds nothing the writer would mind losing.
 *
 * `isEditedPostEmpty()` is stricter than what the writer sees: it allows zero
 * blocks or one empty default block, so a post showing a blank canvas but
 * carrying two empty paragraphs reads as non-empty. Pressing Enter once on an
 * empty post is enough to reach that, and the draft was then refused with "the
 * post already has content" against a visibly blank screen.
 *
 * So fall back to the blocks: a post whose every block is an empty paragraph is
 * empty as far as the writer is concerned. Any real text, or any block that is
 * not a paragraph, still counts as content and stays protected.
 *
 * @param editor - The `core/editor` store.
 * @returns Whether a draft may be written into the post.
 */
function isPostEffectivelyEmpty( editor: any ): boolean {
	if ( selectSafely< boolean >( editor, 'isEditedPostEmpty' ) === true ) {
		return true;
	}

	const blockEditor = getWpDataStore( 'select', 'core/block-editor' );
	const blocks = selectSafely< unknown[] >( blockEditor, 'getBlocks' );

	// An unreadable block list counts as content: refusing costs the user a
	// retry, overwriting costs them their words.
	if ( ! Array.isArray( blocks ) || blocks.length === 0 ) {
		return false;
	}

	return blocks.every( ( block ) => {
		const candidate = block as { name?: unknown; attributes?: { content?: unknown } };

		if ( candidate?.name !== 'core/paragraph' ) {
			return false;
		}

		const content = candidate?.attributes?.content;

		if ( content === undefined || content === null ) {
			return true;
		}

		// RichText content is a string here, but can be a value object elsewhere.
		const text =
			typeof content === 'string' ? content : ( content as { text?: unknown } )?.text ?? '';

		return typeof text === 'string' && text.trim() === '';
	} );
}

/**
 * Handle the apply-draft-content tool call: parse the model's block markup and
 * put it in the editor, but only while the post is still empty.
 * @param input - Tool input: `{ markup, contentType, summary, title? }`.
 * @returns Result describing what was written, or why nothing was.
 */
export function handleApplyDraftContent( input: any ): ApplyDraftContentResult {
	const { markup, contentType: rawContentType, summary, title } = input || {};
	const contentType = normalizeContentType( rawContentType );

	if ( typeof markup !== 'string' || markup.trim() === '' ) {
		return reject( contentType, 'invalid_markup', 'markup is required' );
	}

	const editor = getWpDataStore( 'select', 'core/editor' );
	if ( typeof editor?.isEditedPostEmpty !== 'function' ) {
		return reject( contentType, 'editor_unavailable', 'Editor not available' );
	}

	// The ability is registered for the whole editor surface, but `core/editor`
	// also serves templates and template parts in the site editor — where an
	// "empty" entity is normal and a draft would become site-wide content. Only
	// the post types the entry point offers may be written into.
	const postType = selectSafely< string >( editor, 'getCurrentPostType' );
	if ( ! isDraftAssistPostType( postType ) ) {
		return reject(
			contentType,
			'unsupported_post_type',
			'Draft assist only writes into posts and pages, and this editor is showing something else. Nothing was changed.'
		);
	}

	// The whole point of the guard: never overwrite writing the user already has.
	if ( ! isPostEffectivelyEmpty( editor ) ) {
		return reject(
			contentType,
			'post_not_empty',
			'The post already has content, so the draft was not applied. Nothing in the editor was changed.'
		);
	}

	// `isEditedPostEmpty()` only looks at content, so an empty post can still
	// carry a title the user typed. Never overwrite it — and don't rely on the
	// model omitting `title`.
	const existingTitle = selectSafely< unknown >( editor, 'getEditedPostAttribute', 'title' );
	// The title is only written when the editor positively reports an empty one.
	// An unreadable title counts as present: skipping costs the user a retitle,
	// overwriting costs them their words.
	const hasExistingTitle = typeof existingTitle === 'string' ? existingTitle.trim() !== '' : true;

	let blocks: unknown[] = [];
	try {
		blocks = parse( markup ) ?? [];
	} catch {
		blocks = [];
	}
	// Defensive only. `@wordpress/blocks` is externalized to the host's
	// `wp.blocks`, whose `parse()` turns unrecognized input into freeform /
	// `core/missing` blocks rather than returning `[]` or throwing — so in
	// practice this branch does not fire, and prose that is not block markup is
	// applied as freeform. That is acceptable because the post is empty by the
	// guard above; the branch exists so a host that ever does return nothing
	// cannot blank the canvas.
	if ( ! Array.isArray( blocks ) || blocks.length === 0 ) {
		return reject(
			contentType,
			'invalid_markup',
			'The draft markup could not be parsed as blocks'
		);
	}

	const blockEditor = getWpDataStore( 'dispatch', 'core/block-editor' );
	if ( typeof blockEditor?.resetBlocks !== 'function' ) {
		return reject( contentType, 'editor_unavailable', 'Block editor not available' );
	}

	const requestedTitle = typeof title === 'string' ? title.trim() : '';
	const titleSkipped = requestedTitle !== '' && hasExistingTitle;
	const wantsTitle = requestedTitle !== '' && ! hasExistingTitle;
	const editorDispatch = wantsTitle ? getWpDataStore( 'dispatch', 'core/editor' ) : null;
	if ( wantsTitle && typeof editorDispatch?.editPost !== 'function' ) {
		return reject( contentType, 'editor_unavailable', 'Editor not available' );
	}

	// Content first: a failure here must leave the post exactly as it was, title
	// included. A title write that fails afterwards still leaves a usable draft.
	try {
		blockEditor.resetBlocks( blocks );
	} catch {
		return reject( contentType, 'editor_unavailable', 'Block editor not available' );
	}

	let titleUpdated = false;
	if ( wantsTitle ) {
		try {
			editorDispatch.editPost( { title: requestedTitle } );
			titleUpdated = true;
		} catch {
			// Non-fatal — the draft is in the canvas, the user can retitle it.
		}
	}

	trackDraftAssistDraftApplied( {
		contentType,
		blockCount: blocks.length,
		hasTitle: titleUpdated,
	} );

	return {
		success: true,
		blockCount: blocks.length,
		titleUpdated,
		titleSkipped,
		// Same convention as `handleUpdateBlockContent`: the edit is the end of
		// the turn, and the model's summary is what the user reads in chat.
		returnToAgent: false,
		...( typeof summary === 'string' && summary ? { agentMessage: summary } : {} ),
	};
}
