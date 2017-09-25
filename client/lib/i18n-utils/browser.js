/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

module.exports = require( './utils.js' );

module.exports.getLocaleSlug = function() {
	return i18n.getLocaleSlug();
};

