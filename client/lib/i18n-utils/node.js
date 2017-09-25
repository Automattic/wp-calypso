/**
 * Internal dependencies
 */
import config from 'config';

module.exports = require( './utils.js' );

module.exports.getLocaleSlug = function() {
	return config( 'i18n_default_locale_slug' );
};
