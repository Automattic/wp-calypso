/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import scrollTo from 'lib/scroll-to';

const BULLSEYE_RADIUS = 6;
const DIALOG_WIDTH = 410;
const DIALOG_HEIGHT = 150;
const DIALOG_PADDING = 10;
const MASTERBAR_HEIGHT = 48;

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
		x: document.documentElement.clientWidth - DIALOG_WIDTH - ( 3 * DIALOG_PADDING ),
		y: MASTERBAR_HEIGHT + ( 3 * DIALOG_PADDING ),
	} ),
};

export const query = selector =>
	[].slice.call( global.window.document.querySelectorAll( selector ) );

export const posToCss = ( { x, y } ) => ( {
	top: y ? y + 'px' : undefined,
	left: x ? x + 'px' : undefined,
} );

const bullseyePositioners = {
	below: ( { left, right, bottom } ) => ( {
		x: left + middle( left, right ) - BULLSEYE_RADIUS,
		y: bottom - BULLSEYE_RADIUS * 1.5,
	} ),

	beside: ( { top, bottom, right } ) => ( {
		x: right - BULLSEYE_RADIUS * 1.5,
		y: top + middle( top, bottom ) - BULLSEYE_RADIUS,
	} ),

	center: () => ( {} ),
	middle: () => ( {} ),
};

export function targetForSlug( targetSlug ) {
	return query( '[data-tip-target="' + targetSlug + '"]' )[0];
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

export function getBullseyePosition( { placement = 'center', targetSlug } ) {
	const target = targetForSlug( targetSlug );

	const rect = target
		? target.getBoundingClientRect()
		: global.window.document.body.getBoundingClientRect();

	return bullseyePositioners[ validatePlacement( placement ) ]( rect );
}

function validatePlacement( placement, target ) {
	const targetSlug = target && target.dataset && target.dataset.tipTarget;

	if ( targetSlug === 'sidebar' && viewport.isMobile() ) {
		return 'middle';
	}

	return ( placement !== 'center' && viewport.isMobile() )
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
