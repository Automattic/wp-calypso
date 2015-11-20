/**
 * External dependencies
 */
var find = require( 'lodash/collection/find' );

/**
 * Internal dependencies
 */
var config = require( 'config' );

var i18nUtils = {
	getLanguage: function( langSlug ) {
		return find( config( 'languages' ), { langSlug: langSlug } );
	},

	setUpLocale: function( parameters ) {
		if ( ! parameters.lang && parameters.stepSectionName && i18nUtils.getLanguage( parameters.stepSectionName ) ) {
			parameters.lang = parameters.stepSectionName;
			parameters.stepSectionName = undefined;
		} else if ( ! parameters.lang && parameters.stepName && i18nUtils.getLanguage( parameters.stepName ) ) {
			parameters.lang = parameters.stepName;
			parameters.flowName = undefined;
		} else if ( ! parameters.lang && parameters.flowName && i18nUtils.getLanguage( parameters.flowName ) ) {
			parameters.lang = parameters.flowName;
			parameters.flowName = undefined;
		}
		return parameters;
	},

	/**
	 * Removes the trailing locale slug from the path, if it is present.
	 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
	 * @param {string} path - original path
	 * @returns {string} original path minus locale slug
	 */
	removeLocaleFromPath: function( path ) {
		return path.replace( /([A-z-\/]+)(.*\/)([A-z-]+)(?!.*\/)/, function( match, p1, p2, p3 ) {
			if ( 'undefined' === typeof i18nUtils.getLanguage( p3 ) ) {
				return p1 + p2 + p3;
			}
			return p1;
		} );
	}
};
module.exports = i18nUtils;
