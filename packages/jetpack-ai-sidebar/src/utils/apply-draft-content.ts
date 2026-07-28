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
 * The handler only ever writes into a genuinely empty post. Refusing is
 * returned to the agent (`returnToAgent: true`) so it can tell the user why
 * nothing happened; a successful write is not (`returnToAgent: false`, matching
 * the other editor-mutating handlers in this package), with the model's own
 * `summary` surfaced as the chat message.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from '@wordpress/blocks';
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
					'Optional: a title for the post. When omitted, the existing title is left alone.',
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

	// The whole point of the guard: never overwrite writing the user already has.
	if ( ! editor.isEditedPostEmpty() ) {
		return reject(
			contentType,
			'post_not_empty',
			'The post already has content, so the draft was not applied. Nothing in the editor was changed.'
		);
	}

	let blocks: unknown[] = [];
	try {
		blocks = parse( markup ) ?? [];
	} catch {
		blocks = [];
	}
	if ( ! Array.isArray( blocks ) || blocks.length === 0 ) {
		// Blanking the canvas on unparseable markup would be worse than failing.
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

	const wantsTitle = typeof title === 'string' && title.trim() !== '';
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
			editorDispatch.editPost( { title } );
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
		// Same convention as `handleUpdateBlockContent`: the edit is the end of
		// the turn, and the model's summary is what the user reads in chat.
		returnToAgent: false,
		...( typeof summary === 'string' && summary ? { agentMessage: summary } : {} ),
	};
}
