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
 * Whether a visual check of this edit is actually coming.
 *
 * The flag is the conjunction, resolved by the plugin: the server sets it when
 * the filter is on, and the plugin only forwards it once the rasterizer has
 * produced a capture to check against. A refused or blank capture therefore
 * looks the same here as no check at all, which is what keeps the summary from
 * being withheld for a reply that never arrives.
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
