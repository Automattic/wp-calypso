import { describeElementTarget, type PointerPosition } from '../shared';

export const POINTED_ELEMENT_TOOL_NAME = 'pointed_element_tool';

export const pointedElementToolDefinition = {
	type: 'function',
	name: POINTED_ELEMENT_TOOL_NAME,
	description:
		'Get details about the page element currently under the user’s pointer. Use this when the user refers to “this”, “that”, or the thing they are pointing at.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

interface PointedElementToolContext {
	pointerPosition: PointerPosition | null;
}

export function executePointedElementTool( _rawArgs: unknown, context: PointedElementToolContext ) {
	const pointer = context.pointerPosition;
	if ( ! pointer ) {
		return {
			ok: false,
			error: 'No pointer position is available yet.',
		};
	}

	const target = getPointedElementFromDocument( document, pointer.x, pointer.y );
	if ( ! target ) {
		return {
			ok: false,
			error: 'No page element was found under the user pointer.',
			pointer,
		};
	}

	return {
		ok: true,
		pointer,
		target: describeElementTarget( target ),
	};
}

function getPointedElementFromDocument(
	currentDocument: Document,
	clientX: number,
	clientY: number
): HTMLElement | null {
	const target = currentDocument.elementFromPoint( clientX, clientY ) as HTMLElement | null;
	if ( ! target ) {
		return null;
	}

	if ( ! ( target instanceof HTMLIFrameElement ) ) {
		return target;
	}

	const iframeDocument = getIframeDocument( target );
	if ( ! iframeDocument ) {
		return target;
	}

	const iframeRect = target.getBoundingClientRect();
	return (
		getPointedElementFromDocument(
			iframeDocument,
			Math.round( clientX - iframeRect.left ),
			Math.round( clientY - iframeRect.top )
		) ?? target
	);
}

function getIframeDocument( iframe: HTMLIFrameElement ) {
	try {
		return iframe.contentDocument ?? iframe.contentWindow?.document ?? null;
	} catch {
		return null;
	}
}
