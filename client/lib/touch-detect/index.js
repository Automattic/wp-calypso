/** @ssr-ready **/

/**
 * Module exports.
 */

module.exports = {
	/**
	 * This test is for touch events.
	 * It may not accurately detect a touch screen, but may be close enough depending on the use case.
	 *
	 * @copyright Modernizr © 2009-2015.
	 * @license See CREDITS.md.
	 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
	 *
	 * @returns {Boolean} whether touch screen is available
	 */
	hasTouch: function() {
		/* global DocumentTouch:true */
		return window && ( ( 'ontouchstart' in window ) || window.DocumentTouch && document instanceof DocumentTouch );
	}
};
