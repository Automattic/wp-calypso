const BULLSEYE_RADIUS = 6;
const DIALOG_WIDTH = 410;
const DIALOG_PADDING = 10;
const MASTERBAR_HEIGHT = 48;

const middle = ( a, b ) => Math.abs( b - a ) / 2;

const wouldBeOffscreen = pos =>
	( pos + DIALOG_PADDING + DIALOG_WIDTH ) > document.documentElement.clientWidth

const fitOnScreen = pos =>
	Math.abs( pos - DIALOG_PADDING - DIALOG_WIDTH )

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
		x: middle( left, right ) - DIALOG_WIDTH / 2,
		y: MASTERBAR_HEIGHT / 2,
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

export const bullseyePositioners = {
	below: ( { left, right, bottom } ) => ( {
		x: left + middle( left, right ) - BULLSEYE_RADIUS,
		y: bottom - BULLSEYE_RADIUS * 1.5,
	} ),

	beside: ( { top, bottom, right } ) => ( {
		x: right - BULLSEYE_RADIUS * 1.5,
		y: top + middle( top, bottom ) - BULLSEYE_RADIUS,
	} ),

	center: () => ( {} ),
};

export function getStepPosition( { placement = 'center', target } ) {
	const rect = target
		? target.getBoundingClientRect()
		: global.window.document.body.getBoundingClientRect();

	return dialogPositioners[ placement ]( rect );
}
