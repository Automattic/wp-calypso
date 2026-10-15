import type { UIMessage } from '@automattic/agenttic-client';

export const APPLY_BLOCK_EDITS_TOOL_ID = 'big_sky__apply_block_edits';
export const UPDATE_BLOCK_CONTENT_TOOL_ID = 'wpcom__update_block_content';

const BLOCK_EDIT_TOOL_IDS = new Set( [ APPLY_BLOCK_EDITS_TOOL_ID, UPDATE_BLOCK_CONTENT_TOOL_ID ] );

const DISPLAYABLE_TOOL_MESSAGE_TOOL_IDS = new Set( [
	APPLY_BLOCK_EDITS_TOOL_ID,
	UPDATE_BLOCK_CONTENT_TOOL_ID,
	'big_sky__apply_update_theme',
	'big_sky__edit_entity_record',
	'big_sky__set_site_logo',
	'big_sky__editor_navigate',
	'big_sky__restore_checkpoint',
	'big_sky__open_help_center',
	'big_sky__stream_page_design',
	'wp_admin__navigate',
] );

// Unchecked `JSON.parse` output: callers narrow what they use.
interface ToolMessageData {
	toolId?: unknown;
	toolCallId?: unknown;
	componentType?: unknown;
	summary?: unknown;
}

/** Parses a tool message's JSON text, or `undefined` for invalid JSON. */
export function parseToolMessageText( text: string ): ToolMessageData | undefined {
	try {
		const parsed = JSON.parse( text );
		return {
			toolId: parsed?.tool_id,
			toolCallId: parsed?.tool_call_id,
			componentType: parsed?.data?.type,
			summary: parsed?.data?.summary,
		};
	} catch {
		return undefined;
	}
}

/** Reads the tool data a message carries as JSON in its first content part. */
export function getToolMessageData(
	message: Pick< UIMessage, 'content' >
): ToolMessageData | undefined {
	const firstText = message.content?.[ 0 ]?.text;
	if ( ! firstText ) {
		return undefined;
	}

	return parseToolMessageText( firstText );
}

export function isDisplayableToolMessageTool( toolId: unknown ): toolId is string {
	return typeof toolId === 'string' && DISPLAYABLE_TOOL_MESSAGE_TOOL_IDS.has( toolId );
}

export function getDisplayMessageFromToolData( data: unknown ): string | undefined {
	if ( typeof data !== 'object' || data === null ) {
		return undefined;
	}

	const toolData = data as {
		summary?: unknown;
		result?: {
			message?: unknown;
		};
	};

	if ( typeof toolData.summary === 'string' && toolData.summary.trim() ) {
		return toolData.summary.trim();
	}

	if ( typeof toolData.result?.message === 'string' && toolData.result.message.trim() ) {
		return toolData.result.message.trim();
	}

	return undefined;
}

export type ApplyBlockEditsOutcome = 'updated' | 'no-changes';

/**
 * Whether a visual check of this edit is actually coming: the server sets the
 * flag when the filter is on, and `apply-block-edits` forwards it only once a
 * canvas capture exists to check against, so a refused or blank capture reads
 * as no check at all and the summary is never withheld for a reply that never
 * arrives.
 */
export function isVisualCheckPending( toolId: unknown, data: unknown ): boolean {
	if ( ! isBlockEditToolId( toolId ) || typeof data !== 'object' || data === null ) {
		return false;
	}

	return ( data as { visualCheckPending?: unknown } ).visualCheckPending === true;
}

export function isBlockEditToolId( toolId: unknown ): boolean {
	return typeof toolId === 'string' && BLOCK_EDIT_TOOL_IDS.has( toolId );
}

/**
 * The tool call the server is retrying, sent on its "Adjusting my approach…"
 * progress part. The client renders a block edit's outcome before the server
 * sees it, so this is how an interim "No changes needed" learns it was not final.
 */
export function getRetryingToolCallId( message: unknown ): string | undefined {
	const parts = ( message as { parts?: unknown } | null | undefined )?.parts;
	if ( ! Array.isArray( parts ) ) {
		return undefined;
	}

	for ( const part of parts ) {
		const retryingToolCallId = ( part as { data?: { retryingToolCallId?: unknown } } | null )?.data
			?.retryingToolCallId;
		if ( typeof retryingToolCallId === 'string' && retryingToolCallId ) {
			return retryingToolCallId;
		}
	}

	return undefined;
}

export function getApplyBlockEditsOutcome(
	toolId: unknown,
	data: unknown
): ApplyBlockEditsOutcome | undefined {
	if ( ! isBlockEditToolId( toolId ) || typeof data !== 'object' || data === null ) {
		return undefined;
	}

	const toolData = data as {
		calypsoCheckpointId?: unknown;
		result?: {
			success?: unknown;
			outcome?: unknown;
		};
	};
	const result = toolData.result;

	if ( result && typeof result === 'object' && result.success === true ) {
		return result.outcome === 'updated' || result.outcome === 'no-changes'
			? result.outcome
			: undefined;
	}

	// Older tool results predate the structured result, but only include a
	// checkpoint when an edit was applied.
	return toolId === APPLY_BLOCK_EDITS_TOOL_ID &&
		typeof toolData.calypsoCheckpointId === 'string' &&
		toolData.calypsoCheckpointId
		? 'updated'
		: undefined;
}
