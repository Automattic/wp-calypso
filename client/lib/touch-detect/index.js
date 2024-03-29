// eslint-disable-next-line inclusive-language/use-inclusive-words
/**
 * This test is for touch events.
 * It may not accurately detect a touch screen, but may be close enough depending on the use case.
 * @copyright Modernizr © 2009-2015.
 * @license MIT
 * @see https://github.com/Modernizr/Modernizr/blob/master/LICENSE.md
 * @see https://github.com/Modernizr/Modernizr/blob/HEAD/feature-detects/touchevents.js
 * @returns {boolean} whether touch screen is available
 */
export function hasTouch() {
	/* global DocumentTouch:true */
	return (
		typeof window !== 'undefined' &&
		( 'ontouchstart' in window || ( window.DocumentTouch && document instanceof DocumentTouch ) )
	);
}
