/**
 * Internal dependencies
 */
import config from 'config';

export default require( './utils.js' );

export const getLocaleSlug = function() {
	return config( 'i18n_default_locale_slug' );
};
