/**
 * Internal dependencies
 */
var config = require( 'config' );

export default require( './utils.js' );

export const getLocaleSlug = function() {
	return config( 'i18n_default_locale_slug' );
};
