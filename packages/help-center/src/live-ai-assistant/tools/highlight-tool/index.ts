import {
	describeElementTarget,
	resolveToolCoordinates,
	toolCoordinateParameters,
	type ToolRuntimeContext,
} from '../shared';

export const HIGHLIGHT_TOOL_NAME = 'highlight_tool';

export const highlightToolDefinition = {
	type: 'function',
	name: HIGHLIGHT_TOOL_NAME,
	description:
		'Draw a red highlight box around the page element at the given viewport x/y coordinates from the latest page summary. Call page_summary_tool first.',
	parameters: toolCoordinateParameters,
} as const;

interface HighlightToolContext extends ToolRuntimeContext {
	showHighlight: ( target: HTMLElement ) => void;
}

export function executeHighlightTool( rawArgs: unknown, context: HighlightToolContext ) {
	const resolved = resolveToolCoordinates( rawArgs, context );
	if ( ! resolved.ok ) {
		return resolved;
	}

	const target = document.elementFromPoint(
		resolved.mapped_client_x,
		resolved.mapped_client_y
	) as HTMLElement | null;
	if ( ! target ) {
		return {
			ok: false,
			error: 'No page element was found at those coordinates to highlight.',
			mapped_client_x: resolved.mapped_client_x,
			mapped_client_y: resolved.mapped_client_y,
		};
	}

	context.showHighlight( target );

	return {
		ok: true,
		requested_image_x: resolved.requested_image_x,
		requested_image_y: resolved.requested_image_y,
		mapped_client_x: resolved.mapped_client_x,
		mapped_client_y: resolved.mapped_client_y,
		target: describeElementTarget( target ),
	};
}
