export interface PageSummaryMetadata {
	viewportWidth: number;
	viewportHeight: number;
	scrollX: number;
	scrollY: number;
}

export interface PointerPosition {
	x: number;
	y: number;
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
	isPageContextEnabled: boolean;
	lastPageSummary: PageSummaryMetadata | null;
	pointerPosition?: PointerPosition | null;
}

export const toolCoordinateParameters = {
	type: 'object',
	properties: {
		x: {
			type: 'number',
			description: 'Horizontal coordinate in viewport pixels from the latest page summary.',
		},
		y: {
			type: 'number',
			description: 'Vertical coordinate in viewport pixels from the latest page summary.',
		},
	},
	required: [ 'x', 'y' ],
	additionalProperties: false,
} as const;

export function resolveToolCoordinates(
	rawArgs: unknown,
	context: ToolRuntimeContext
): ToolCoordinateResolution {
	if ( ! context.isPageContextEnabled ) {
		return {
			ok: false,
			error: 'No page summary is available. Call page_summary_tool first.',
		};
	}

	const summary = context.lastPageSummary;
	if ( ! summary ) {
		return {
			ok: false,
			error: 'No page summary is available. Call page_summary_tool first.',
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

	return {
		ok: true,
		requested_image_x: x,
		requested_image_y: y,
		mapped_client_x: Math.max( 0, Math.min( summary.viewportWidth - 1, Math.round( x ) ) ),
		mapped_client_y: Math.max( 0, Math.min( summary.viewportHeight - 1, Math.round( y ) ) ),
	};
}

export function describeElementTarget( target: HTMLElement | null ) {
	if ( ! target ) {
		return null;
	}

	const rect = target.getBoundingClientRect();

	return {
		tag: target.tagName.toLowerCase(),
		role: target.getAttribute( 'role' ) ?? defaultRoleForElement( target ),
		label: getElementLabel( target ),
		text: normalizeText( target.textContent ),
		aria_label: target.getAttribute( 'aria-label' ) ?? '',
		id: target.id || '',
		class_name: target.className || '',
		href: target instanceof HTMLAnchorElement ? target.href : '',
		coordinates: {
			left: round( rect.left ),
			top: round( rect.top ),
			width: round( rect.width ),
			height: round( rect.height ),
			center_x: round( rect.left + rect.width / 2 ),
			center_y: round( rect.top + rect.height / 2 ),
		},
	};
}

function getElementLabel( element: HTMLElement ) {
	const ariaLabel = normalizeText( element.getAttribute( 'aria-label' ) || '' );
	if ( ariaLabel ) {
		return ariaLabel;
	}

	const labelledBy = normalizeText(
		( element.getAttribute( 'aria-labelledby' ) || '' )
			.split( /\s+/ )
			.filter( Boolean )
			.map( ( id ) => document.getElementById( id )?.textContent || '' )
			.join( ' ' )
	);
	if ( labelledBy ) {
		return labelledBy;
	}

	if (
		element instanceof HTMLInputElement ||
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement
	) {
		if ( element.labels?.length ) {
			return normalizeText(
				Array.from( element.labels )
					.map( ( label ) => label.textContent || '' )
					.join( ' ' )
			);
		}
	}

	const closestLabel = element.closest( 'label' );
	if ( closestLabel instanceof HTMLElement ) {
		return normalizeText( closestLabel.textContent );
	}

	return normalizeText( element.textContent );
}

function defaultRoleForElement( element: HTMLElement ) {
	switch ( element.tagName.toLowerCase() ) {
		case 'a':
			return 'link';
		case 'button':
			return 'button';
		case 'input':
			return ( element as HTMLInputElement ).type || 'input';
		case 'select':
			return 'select';
		case 'textarea':
			return 'textbox';
		case 'li':
			return 'listitem';
		default:
			return '';
	}
}

function normalizeText( text: string | null | undefined ) {
	return ( text || '' ).replace( /\s+/g, ' ' ).trim().slice( 0, 160 );
}

function round( value: number ) {
	return Math.round( value * 10 ) / 10;
}
