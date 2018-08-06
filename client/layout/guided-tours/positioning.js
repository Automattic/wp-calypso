/** @format */

/**
 * External dependencies
 */

import { find, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { isMobile } from 'lib/viewport';
import scrollTo from 'lib/scroll-to';

const DIALOG_WIDTH = 410;
const DIALOG_HEIGHT = 150;
const DIALOG_PADDING = 10;
const MASTERBAR_HEIGHT = 47;

const middle = ( a, b ) => Math.abs( b - a ) / 2;

const wouldBeOffscreen = pos => {
	return pos < 0 || pos + DIALOG_PADDING + DIALOG_WIDTH > document.documentElement.clientWidth;
};

const fitOnScreen = pos => {
	return Math.max( 0, pos - DIALOG_PADDING - DIALOG_WIDTH );
};

const helpers = {
	yAbove: top => {
		return top - DIALOG_HEIGHT;
	},
	yBelow: bottom => {
		return bottom + DIALOG_PADDING;
	},
	xAboveBelow: ( left, right, width ) => {
		if ( left + DIALOG_WIDTH + DIALOG_PADDING < document.documentElement.clientWidth ) {
			return left + DIALOG_PADDING;
		} else if ( right - DIALOG_WIDTH - DIALOG_PADDING > 0 ) {
			return right - ( DIALOG_WIDTH - width );
		}
		return DIALOG_PADDING;
	},
};

const dialogPositioners = {
	below: rect => {
		const x = helpers.xAboveBelow( rect.left, rect.right, rect.width );
		const y = helpers.yBelow( rect.bottom );

		return { x, y };
	},
	above: rect => {
		const x = helpers.xAboveBelow( rect.left, rect.right, rect.width );
		const y = helpers.yAbove( rect.top );

		return { x, y };
	},
	beside: ( { left, right, top } ) => ( {
		x: wouldBeOffscreen( right ) ? fitOnScreen( left ) : right + DIALOG_PADDING,
		y: top + DIALOG_PADDING,
	} ),
	center: ( { left, right } ) => ( {
		x: Math.max( 0, middle( left, right ) - DIALOG_WIDTH / 2 ),
		y: 0.2 * document.documentElement.clientHeight,
	} ),
	middle: ( { left, right } ) => ( {
		x: Math.max( 0, middle( left, right ) - DIALOG_WIDTH / 2 ),
		y: MASTERBAR_HEIGHT / 2 + DIALOG_HEIGHT / 2,
	} ),
	right: () => ( {
		x: Math.max( 0, document.documentElement.clientWidth - DIALOG_WIDTH - 3 * DIALOG_PADDING ),
		y: MASTERBAR_HEIGHT + 16,
	} ),
};

export const query = selector => [].slice.call( window.document.querySelectorAll( selector ) );

export const posToCss = ( { x, y } ) => ( {
	top: y ? y + 'px' : undefined,
	left: x ? x + 'px' : undefined,
} );

function hasNonEmptyClientRect( el ) {
	const rect = el.getBoundingClientRect();
	return ! ( rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0 );
}

// discern between tip targets and regular CSS by grepping for CSS-only characters
const CSS_SELECTOR_REGEX = /[.# ]/;
const isCssSelector = targetSlug => CSS_SELECTOR_REGEX.test( targetSlug );

export function targetForSlug( targetSlug ) {
	if ( ! targetSlug ) {
		return null;
	}

	const cssSelector = isCssSelector( targetSlug )
		? targetSlug
		: `[data-tip-target="${ targetSlug }"]`;

	const targetEls = query( cssSelector );
	return find( targetEls, hasNonEmptyClientRect ) || null;
}

export function getValidatedArrowPosition( { targetSlug, arrow, stepPos } ) {
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
		( startsWith( arrow, 'left' ) || startsWith( arrow, 'right' ) ) &&
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
	targetSlug,
	shouldScrollTo = false,
	scrollContainer = null,
} ) {
	const target = targetForSlug( targetSlug );
	const scrollDiff = target && shouldScrollTo ? scrollIntoView( target, scrollContainer ) : 0;
	const rect =
		target && target.getBoundingClientRect
			? target.getBoundingClientRect()
			: window.document.body.getBoundingClientRect();
	const position = dialogPositioners[ validatePlacement( placement, target ) ]( rect );

	return {
		x: position.x,
		y: position.y - scrollDiff + ( scrollDiff !== 0 ? DIALOG_PADDING : 0 ),
	};
}

export function getScrollableSidebar() {
	if ( isMobile() ) {
		return query( '#secondary .sidebar' )[ 0 ];
	}
	return query( '#secondary .sidebar .sidebar__region' )[ 0 ];
}

function validatePlacement( placement, target ) {
	const targetSlug = target && target.dataset && target.dataset.tipTarget;

	if ( targetSlug === 'sidebar' && isMobile() ) {
		return 'middle';
	}

	return target && placement !== 'center' && isMobile() ? 'below' : placement;
}

function scrollIntoView( target, scrollContainer ) {
	// TODO(lsinger): consider replacing with http://yiminghe.me/dom-scroll-into-view/
	const container = scrollContainer || getScrollableSidebar();
	const { top, bottom } = target.getBoundingClientRect();
	const clientHeight = isMobile() ? document.documentElement.clientHeight : container.clientHeight;

	if ( bottom + DIALOG_PADDING + DIALOG_HEIGHT <= clientHeight ) {
		return 0;
	}

	const scrollMax = container.scrollHeight - clientHeight - container.scrollTop;
	const y = Math.min( 0.75 * top, scrollMax );

	scrollTo( { y, container } );
	return y;
}
