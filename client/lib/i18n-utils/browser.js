/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' );

export default require( './utils.js' );

export const getLocaleSlug = function() {
	return i18n.getLocaleSlug();
};

