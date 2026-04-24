import {
	describeElementTarget,
	resolveToolCoordinates,
	toolCoordinateParameters,
	type ToolRuntimeContext,
} from '../shared';

export const CLICK_TOOL_NAME = 'click_tool';

export const clickToolDefinition = {
	type: 'function',
	name: CLICK_TOOL_NAME,
	description:
		'Click on the current shared-tab screenshot at the given x/y coordinates. Use only when the user explicitly asks you to click or press something on the page. Coordinates must be in the latest shared image pixel space, not CSS pixels.',
	parameters: toolCoordinateParameters,
} as const;

export function executeClickTool( rawArgs: unknown, context: ToolRuntimeContext ) {
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
			error: 'No clickable element was found at those coordinates.',
			mapped_client_x: resolved.mapped_client_x,
			mapped_client_y: resolved.mapped_client_y,
		};
	}

	target.focus?.();
	for ( const type of [ 'mousemove', 'mousedown', 'mouseup', 'click' ] ) {
		target.dispatchEvent(
			new MouseEvent( type, {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: resolved.mapped_client_x,
				clientY: resolved.mapped_client_y,
				button: 0,
			} )
		);
	}

	return {
		ok: true,
		requested_image_x: resolved.requested_image_x,
		requested_image_y: resolved.requested_image_y,
		mapped_client_x: resolved.mapped_client_x,
		mapped_client_y: resolved.mapped_client_y,
		target: describeElementTarget( target ),
	};
}
