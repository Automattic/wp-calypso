export interface ScreenFrameMetadata {
	imageWidth: number;
	imageHeight: number;
	viewportWidth: number;
	viewportHeight: number;
}

export interface ToolCoordinateFailure {
	ok: false;
	error: string;
	mapped_client_x?: number;
	mapped_client_y?: number;
}

export interface ToolCoordinateSuccess {
	ok: true;
	requested_image_x: number;
	requested_image_y: number;
	mapped_client_x: number;
	mapped_client_y: number;
}

export type ToolCoordinateResolution = ToolCoordinateFailure | ToolCoordinateSuccess;

export interface ToolRuntimeContext {
	isSharingScreen: boolean;
	lastScreenFrame: ScreenFrameMetadata | null;
}

export const toolCoordinateParameters = {
	type: 'object',
	properties: {
		x: {
			type: 'number',
			description: 'Horizontal coordinate in pixels within the latest shared screenshot image.',
		},
		y: {
			type: 'number',
			description: 'Vertical coordinate in pixels within the latest shared screenshot image.',
		},
	},
	required: [ 'x', 'y' ],
	additionalProperties: false,
} as const;

export function resolveToolCoordinates(
	rawArgs: unknown,
	context: ToolRuntimeContext
): ToolCoordinateResolution {
	if ( ! context.isSharingScreen ) {
		return {
			ok: false,
			error: 'Screen sharing is not active.',
		};
	}

	const frame = context.lastScreenFrame;
	if ( ! frame ) {
		return {
			ok: false,
			error: 'No shared-screen frame is available yet.',
		};
	}

	let args: { x?: number; y?: number };
	try {
		args =
			typeof rawArgs === 'string'
				? JSON.parse( rawArgs )
				: ( rawArgs as { x?: number; y?: number } );
	} catch {
		return {
			ok: false,
			error: 'Tool arguments were not valid JSON.',
		};
	}

	const x = Number( args?.x );
	const y = Number( args?.y );
	if ( ! Number.isFinite( x ) || ! Number.isFinite( y ) ) {
		return {
			ok: false,
			error: 'Tool arguments must include numeric x and y coordinates.',
		};
	}

	const normalizedX = Math.max( 0, Math.min( 1, x / frame.imageWidth ) );
	const normalizedY = Math.max( 0, Math.min( 1, y / frame.imageHeight ) );
	debugger

	return {
		ok: true,
		requested_image_x: x,
		requested_image_y: y,
		mapped_client_x: Math.max(
			0,
			Math.min( frame.viewportWidth - 1, Math.round( normalizedX * frame.viewportWidth ) )
		),
		mapped_client_y: Math.max(
			0,
			Math.min( frame.viewportHeight - 1, Math.round( normalizedY * frame.viewportHeight ) )
		),
	};
}

export function describeElementTarget( target: HTMLElement | null ) {
	if ( ! target ) {
		return null;
	}

	return {
		tag: target.tagName.toLowerCase(),
		text: target.textContent?.trim()?.slice( 0, 120 ) ?? '',
		aria_label: target.getAttribute( 'aria-label' ) ?? '',
	};
}
