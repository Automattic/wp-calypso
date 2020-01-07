/**
 * This test is for touch events.
 * It may not accurately detect a touch screen, but may be close enough depending on the use case.
 *
 * @copyright Modernizr © 2009-2015.
 * @license See CREDITS.md.
 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
 *
 * @returns {boolean} whether touch screen is available
 */
export function hasTouch() {
	/* global DocumentTouch:true */
	return (
		window &&
		( 'ontouchstart' in window || ( window.DocumentTouch && document instanceof DocumentTouch ) )
	);
}
