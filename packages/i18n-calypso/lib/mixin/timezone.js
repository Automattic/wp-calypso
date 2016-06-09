/**
 * External dependencies
 */
var tzdetect = require( 'jstimezonedetect' );

/**
 * Detect and return the current timezone of the browser
 *
 * @return {String} timezone
 */
module.exports = function timezone() {
	var detected = tzdetect.jstz.determine();
	return detected ? detected.name() : null;
};
