/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import scrollTo from 'lib/scroll-to';

const DIALOG_WIDTH = 410;
const DIALOG_HEIGHT = 150;
const DIALOG_PADDING = 10;
const MASTERBAR_HEIGHT = 47;

const middle = ( a, b ) => Math.abs( b - a ) / 2;

const wouldBeOffscreen = pos =>
	pos < 0 || ( pos + DIALOG_PADDING + DIALOG_WIDTH ) >
		document.documentElement.clientWidth;

const fitOnScreen = pos =>
	Math.max( 0, pos - DIALOG_PADDING - DIALOG_WIDTH ) / 2;

const dialogPositioners = {
	below: ( { left, bottom } ) => ( {
		x: wouldBeOffscreen( left )
			? fitOnScreen( document.documentElement.clientWidth )
			: left + DIALOG_PADDING,
		y: bottom + DIALOG_PADDING,
	} ),
	beside: ( { left, right, top } ) => ( {
		x: wouldBeOffscreen( right )
			? fitOnScreen( left )
			: right + DIALOG_PADDING,
		y: top + DIALOG_PADDING,
	} ),
	center: ( { left, right } ) => ( {
		x: Math.max( 0, middle( left, right ) - DIALOG_WIDTH / 2 ),
		y: MASTERBAR_HEIGHT / 2,
	} ),
	middle: ( { left, right } ) => ( {
		x: Math.max( 0, middle( left, right ) - DIALOG_WIDTH / 2 ),
		y: MASTERBAR_HEIGHT / 2 + DIALOG_HEIGHT / 2,
	} ),
	right: () => ( {
		x: Math.max( 0, document.documentElement.clientWidth - DIALOG_WIDTH - ( 3 * DIALOG_PADDING ) ),
		y: MASTERBAR_HEIGHT + 16,
	} ),
};

export const query = selector =>
	[].slice.call( global.window.document.querySelectorAll( selector ) );

export const posToCss = ( { x, y } ) => ( {
	top: y ? y + 'px' : undefined,
	left: x ? x + 'px' : undefined,
} );

export function targetForSlug( targetSlug ) {
	return query( '[data-tip-target="' + targetSlug + '"]' )[ 0 ];
}

export function getValidatedArrowPosition( { targetSlug, arrow, stepPos } ) {
	const target = targetForSlug( targetSlug );
	const rect = target && target.getBoundingClientRect
		? target.getBoundingClientRect()
		: global.window.document.body.getBoundingClientRect();

	if ( stepPos.y >= rect.top &&
		stepPos.y <= rect.bottom &&
		stepPos.x >= rect.left &&
		stepPos.x <= rect.right ) {
		// step contained within target rect
		return 'none';
	}

	if ( ( startsWith( arrow, 'left' ) ||
		startsWith( arrow, 'right' ) ) &&
		DIALOG_WIDTH > 0.98 * document.documentElement.clientWidth ) {
		// window not wide enough for adding an arrow
		// seems good enough for now, can take other things into account later
		// (e.g.: maybe we need to point downwards)
		return 'top-left';
	}

	return arrow;
}

export function getStepPosition( { placement = 'center', targetSlug } ) {
	const target = targetForSlug( targetSlug );
	const scrollDiff = scrollIntoView( target );
	const rect = target && target.getBoundingClientRect
		? target.getBoundingClientRect()
		: global.window.document.body.getBoundingClientRect();
	const position = dialogPositioners[ validatePlacement( placement, target ) ]( rect );

	return {
		x: position.x,
		y: position.y - scrollDiff +
			( scrollDiff !== 0 ? DIALOG_PADDING : 0 )
	};
}

function validatePlacement( placement, target ) {
	const targetSlug = target && target.dataset && target.dataset.tipTarget;

	if ( targetSlug === 'sidebar' && viewport.isMobile() ) {
		return 'middle';
	}

	return ( target && placement !== 'center' && viewport.isMobile() )
		? 'below'
		: placement;
}

function scrollIntoView( target ) {
	const targetSlug = target && target.dataset && target.dataset.tipTarget;

	if ( targetSlug !== 'themes' ) {
		return 0;
	}

	const { top, bottom } = target.getBoundingClientRect();

	if ( bottom + DIALOG_PADDING + DIALOG_HEIGHT <=
			document.documentElement.clientHeight ) {
		return 0;
	}

	const container = query( '#secondary .sidebar' )[ 0 ];
	const scrollMax = container.scrollHeight -
		container.clientHeight - container.scrollTop;
	const y = Math.min( .75 * top, scrollMax );

	scrollTo( { y, container } );
	return y;
}
