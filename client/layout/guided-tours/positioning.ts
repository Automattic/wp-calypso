import { isMobile } from '@automattic/viewport';
import { CSSProperties } from 'react';
import scrollTo from 'calypso/lib/scroll-to';
import { Coordinate, DialogPosition, ArrowPosition } from './types';

const DIALOG_WIDTH = 410;
const DIALOG_HEIGHT = 150;
const DIALOG_PADDING = 10;
const MASTERBAR_HEIGHT = 47;

const middle = ( a: number, b: number ) => Math.abs( b - a ) / 2;

const wouldBeOffscreen = ( pos: number ) => {
	return pos < 0 || pos + DIALOG_PADDING + DIALOG_WIDTH > document.documentElement.clientWidth;
};

const fitOnScreen = ( pos: number ) => {
	return Math.max( 0, pos - DIALOG_PADDING - DIALOG_WIDTH );
};

function yAbove( top: number ) {
	return top - DIALOG_HEIGHT;
}
function yBelow( bottom: number ) {
	return bottom + DIALOG_PADDING;
}

// Left align to target if target is on the left of body center.
// TODO: This hack should be removed because it's unnecessary and potentially problematic.
// Unnecessary because, given that placement is determined manually, alignment can also be specified.
// Potentially problematic because full document view is used instead of target content area.
function xAboveBelow( left: number, right: number ) {
	const leftAlign = left + middle( left, right ) < document.documentElement.clientWidth / 2;
	if ( leftAlign ) {
		return left + DIALOG_PADDING;
	} else if ( right - DIALOG_WIDTH - DIALOG_PADDING > 0 ) {
		return right - DIALOG_WIDTH;
	}
	return DIALOG_PADDING;
}

function getDialogPosition( position: DialogPosition, rect: ClientRect ): Coordinate {
	switch ( position ) {
		case 'above':
			return { x: xAboveBelow( rect.left, rect.right ), y: yAbove( rect.top ) };
		case 'below':
			return { x: xAboveBelow( rect.left, rect.right ), y: yBelow( rect.bottom ) };
		case 'beside':
			return {
				x: wouldBeOffscreen( rect.right ) ? fitOnScreen( rect.left ) : rect.right + DIALOG_PADDING,
				y: rect.top + DIALOG_PADDING,
			};
		case 'left':
			return {
				x: fitOnScreen( rect.left ),
				y: rect.top + DIALOG_PADDING,
			};
		case 'center':
			return {
				x: Math.max( 0, middle( rect.left, rect.right ) - DIALOG_WIDTH / 2 ),
				y: 0.2 * document.documentElement.clientHeight,
			};
		case 'middle':
			return {
				x: Math.max( 0, middle( rect.left, rect.right ) - DIALOG_WIDTH / 2 ),
				y: MASTERBAR_HEIGHT / 2 + DIALOG_HEIGHT / 2,
			};
		case 'right':
			return {
				x: Math.max( 0, document.documentElement.clientWidth - DIALOG_WIDTH - 3 * DIALOG_PADDING ),
				y: MASTERBAR_HEIGHT + 16,
			};
	}
}

export const query = ( selector: string ) =>
	Array.from( window.document.querySelectorAll( selector ) );

export const posToCss = ( { x, y }: Coordinate ): Pick< CSSProperties, 'top' | 'left' > => ( {
	top: y ? y + 'px' : undefined,
	left: x ? x + 'px' : undefined,
} );

function hasNonEmptyClientRect( el: Element ) {
	const rect = el.getBoundingClientRect();
	return ! ( rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0 );
}

// discern between tip targets and regular CSS by grepping for CSS-only characters
const CSS_SELECTOR_REGEX = /[.# ]/;
const isCssSelector = ( targetSlug: string ) => CSS_SELECTOR_REGEX.test( targetSlug );

export function targetForSlug( targetSlug?: string ) {
	if ( ! targetSlug ) {
		return null;
	}

	const cssSelector = isCssSelector( targetSlug )
		? targetSlug
		: `[data-tip-target="${ targetSlug }"]`;

	const targetEls = query( cssSelector );
	return targetEls.find( hasNonEmptyClientRect ) || null;
}

export function getValidatedArrowPosition( {
	targetSlug,
	arrow,
	stepPos,
}: {
	targetSlug: string;
	arrow?: ArrowPosition;
	stepPos: Coordinate;
} ): ArrowPosition | 'none' {
	const target = targetForSlug( targetSlug );
	const rect =
		target && target.getBoundingClientRect
			? target.getBoundingClientRect()
			: window.document.body.getBoundingClientRect();

	if (
		stepPos.y >= rect.top &&
		stepPos.y <= rect.bottom &&
		stepPos.x >= rect.left &&
		stepPos.x <= rect.right
	) {
		// step contained within target rect
		return 'none';
	}

	if (
		arrow &&
		( arrow.startsWith( 'left' ) || arrow.startsWith( 'right' ) ) &&
		DIALOG_WIDTH > 0.98 * document.documentElement.clientWidth
	) {
		// window not wide enough for adding an arrow
		// seems good enough for now, can take other things into account later
		// (e.g.: maybe we need to point downwards)
		return 'top-left';
	}

	return arrow || 'none';
}

export function getStepPosition( {
	placement = 'center',
	scrollContainer = null,
	shouldScrollTo = false,
	targetSlug,
}: {
	placement?: DialogPosition;
	scrollContainer: Element | null;
	shouldScrollTo: boolean;
	targetSlug?: string;
} ): {
	stepPos: Coordinate;
	scrollDiff: number;
} {
	const target = targetForSlug( targetSlug );
	const scrollDiff = target && shouldScrollTo ? scrollIntoView( target, scrollContainer ) : 0;
	const rect =
		target && target.getBoundingClientRect
			? target.getBoundingClientRect()
			: window.document.body.getBoundingClientRect();
	const validatedPlacement = validatePlacement( placement, target );
	const position = getDialogPosition( validatedPlacement, rect );
	const stepPos = {
		x: position.x,
		y: position.y - scrollDiff + ( scrollDiff !== 0 ? DIALOG_PADDING : 0 ),
	};

	return {
		stepPos,
		scrollDiff,
	};
}

export function getScrollableSidebar() {
	if ( isMobile() ) {
		return query( '#secondary .sidebar' )[ 0 ];
	}
	return query( '#secondary .sidebar .sidebar__region' )[ 0 ];
}

function validatePlacement( placement: DialogPosition, target: Element | null ): DialogPosition {
	const targetSlug =
		target && ( target as HTMLElement ).dataset && ( target as HTMLElement ).dataset.tipTarget;

	if ( targetSlug === 'sidebar' && isMobile() ) {
		return 'middle';
	}

	return target && placement !== 'center' && isMobile() ? 'below' : placement;
}

function scrollIntoView( target: Element, scrollContainer: Element | null ) {
	const container = scrollContainer || getScrollableSidebar();
	const { top, bottom } = target.getBoundingClientRect();
	let { clientHeight, scrollHeight, scrollTop } = container;

	if ( isMobile() ) {
		clientHeight = document.documentElement.clientHeight;
	} else if ( window === scrollContainer ) {
		// An improvement here could be to limit DOM access, via some sort of memoization
		const body = document.querySelector( 'body' );

		if ( body ) {
			// The following properties are not available on the window object.
			clientHeight = body.clientHeight;
			scrollHeight = body.scrollHeight;
			scrollTop = body.scrollTop;
		}
	}

	if (
		// Dialog isn't hidden at the bottom of the container
		bottom + DIALOG_PADDING + DIALOG_HEIGHT <= clientHeight &&
		// Dialog isn't hidden at the top of the container
		bottom > MASTERBAR_HEIGHT + DIALOG_PADDING
	) {
		return 0;
	}

	const scrollMax = scrollHeight - clientHeight - scrollTop;
	const y = Math.min( 0.75 * top, scrollMax );

	scrollTo( { y, container } );
	return y;
}
