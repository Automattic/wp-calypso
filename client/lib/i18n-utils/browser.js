/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' );

module.exports = require( './utils.js' );

module.exports.getLocaleSlug = function() {
	return i18n.getLocaleSlug();
};

