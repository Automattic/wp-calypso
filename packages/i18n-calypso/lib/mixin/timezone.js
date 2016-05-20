/**
 * External dependencies
 */
var jstz = require( 'jstimezonedetect' );

/**
 * Detect and return the current timezone of the browser
 *
 * @return {String} timezone
 */
module.exports = function timezone() {
	var detected = jstz.determine();
	return detected ? detected.name() : null;
};
