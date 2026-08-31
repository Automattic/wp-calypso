/**
 * Client ability `jetpack-ai/apply-draft-content` — writes a generated first
 * draft into the post the user has open.
 *
 * wpcom's draft ability returns an `Input_Required_Result` naming this tool.
 * Agents Manager normalizes `jetpack-ai/apply-draft-content` →
 * `jetpack_ai__apply_draft_content`, so both spellings must be accepted — same
 * as `wpcom/update-block-content` (see `tool-provider.ts`).
 *
 * The handler writes only into an empty post of a supported type, and never
 * over a title the user typed.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from '@wordpress/blocks';
import { isDraftAssistPostType, isPostEffectivelyEmpty } from './draft-assist';
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
 * Whether a tool id addresses this ability, in either spelling.
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
	/** The model sent a title but the post already had one, so the user's was kept. */
	titleSkipped?: boolean;
}

// Read stores through `window.wp.data`, like `block-actions.ts` does: a bundle
// loaded outside the editor then fails cleanly instead of throwing.
function getWpDataStore( kind: 'select' | 'dispatch', storeName: string ): any | null {
	try {
		const wpData = ( window as any ).wp?.data;
		return wpData?.[ kind ] ? wpData[ kind ]( storeName ) ?? null : null;
	} catch {
		return null;
	}
}

/**
 * Call a selector without letting a throw escape.
 * @param store  - Store from `getWpDataStore`.
 * @param method - Selector name.
 * @param args   - Selector arguments.
 * @returns Its return value, or undefined if missing or throwing.
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

// `returnToAgent: true` so the agent can tell the user why nothing happened.
function reject(
	contentType: DraftAssistContentType,
	reason: DraftAssistRejectionReason,
	error: string
): ApplyDraftContentResult {
	trackDraftAssistDraftRejected( { contentType, reason } );
	return { success: false, error, returnToAgent: true };
}

/**
 * Handle the tool call: parse the model's block markup into the editor, but
 * only while the post is still empty.
 * @param input - Tool input: `{ markup, contentType, summary, title? }`.
 * @returns What was written, or why nothing was.
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
	// also serves templates in the site editor — where "empty" is normal and a
	// draft would become site-wide content.
	const postType = selectSafely< string >( editor, 'getCurrentPostType' );
	if ( ! isDraftAssistPostType( postType ) ) {
		return reject(
			contentType,
			'unsupported_post_type',
			'Draft assist only writes into posts and pages, and this editor is showing something else. Nothing was changed.'
		);
	}

	if ( ! isPostEffectivelyEmpty() ) {
		return reject(
			contentType,
			'post_not_empty',
			'The post already has content, so the draft was not applied. Nothing in the editor was changed.'
		);
	}

	let blocks: unknown[];
	try {
		const parsed = parse( markup );
		blocks = Array.isArray( parsed ) ? parsed : [];
	} catch {
		blocks = [];
	}
	// Defensive only: the host's `wp.blocks` parse() turns unrecognized input
	// into freeform blocks rather than returning [] or throwing. Prose that is
	// not block markup is applied as-is, which is fine because the post is empty.
	// Don't write tests that mock parse() into throwing — production never does.
	if ( blocks.length === 0 ) {
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

	// `isEditedPostEmpty()` ignores the title, so an empty post can still carry
	// one the user typed. An unreadable title counts as present: skipping costs
	// a retitle, overwriting costs the user their words. Don't relax this to
	// "the model will omit `title`".
	const existingTitle = selectSafely< unknown >( editor, 'getEditedPostAttribute', 'title' );
	const hasExistingTitle = typeof existingTitle === 'string' ? existingTitle.trim() !== '' : true;
	const requestedTitle = typeof title === 'string' ? title.trim() : '';
	const titleSkipped = requestedTitle !== '' && hasExistingTitle;
	const wantsTitle = requestedTitle !== '' && ! hasExistingTitle;

	const editorDispatch = wantsTitle ? getWpDataStore( 'dispatch', 'core/editor' ) : null;
	if ( wantsTitle && typeof editorDispatch?.editPost !== 'function' ) {
		return reject( contentType, 'editor_unavailable', 'Editor not available' );
	}

	// Content first, so a failure here leaves the post exactly as it was. A
	// failed title afterwards still leaves a usable draft.
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
			// Non-fatal: the draft is in the canvas, the user can retitle it.
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
		// Like `handleUpdateBlockContent`: the edit ends the turn, and the
		// model's summary is what the user reads in chat.
		returnToAgent: false,
		...( typeof summary === 'string' && summary ? { agentMessage: summary } : {} ),
	};
}
