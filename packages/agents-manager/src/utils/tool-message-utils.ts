const DISPLAYABLE_TOOL_MESSAGE_TOOL_IDS = new Set( [
	'big_sky__apply_block_edits',
	'big_sky__apply_update_theme',
	'big_sky__edit_entity_record',
	'big_sky__set_site_logo',
	'big_sky__editor_navigate',
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
