/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' );

module.exports = require( './utils.js' );

module.exports.getLocaleSlug = function() {
	return i18n.getLocaleSlug();
};

