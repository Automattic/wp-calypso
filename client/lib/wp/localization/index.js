/**
 * External dependencies
 */
import { parse, stringify } from 'qs';
import i18n from 'i18n-calypso';

/**
 * Given a WPCOM parameter set, modifies the query such that a non-default
 * locale is added to the query parameter.
 *
 * @param  {object} params Original parameters
 * @returns {object}        Revised parameters, if non-default locale
 */
export function addLocaleQueryParam( params ) {
	const locale = i18n.getLocaleVariant() || i18n.getLocaleSlug();

	if ( ! locale || 'en' === locale ) {
		return params;
	}

	let localeQueryParam;
	const query = parse( params.query );

	if ( params.apiNamespace ) {
		// v2 api request
		localeQueryParam = { _locale: locale };
	} else {
		localeQueryParam = { locale };
	}

	return Object.assign( params, {
		query: stringify( Object.assign( query, localeQueryParam ) ),
	} );
}

/**
 * Modifies a WPCOM instance, returning an updated instance with included
 * localization helpers. Specifically, this adds a locale query parameter
 * by default.
 *
 * @param {object} wpcom Original WPCOM instance
 * @returns {object} Modified WPCOM instance with localization helpers
 */
export function injectLocalization( wpcom ) {
	const originalRequest = wpcom.request.bind( wpcom );
	return Object.assign( wpcom, {
		localized: true,

		request: function ( params, callback ) {
			return originalRequest( addLocaleQueryParam( params ), callback );
		},
	} );
}
