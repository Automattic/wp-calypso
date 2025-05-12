import { getLocaleData } from '@wordpress/i18n';
import { parse, stringify } from 'qs';

/**
 * Given a WPCOM parameter set, modifies the query such that a non-default
 * locale is added to the query parameter.
 * @param  {Object} params Original parameters
 * @returns {Object}        Revised parameters, if non-default locale
 */
export function addLocaleQueryParam( params ) {
	const localeData = getLocaleData();
	const locale = localeData?.[ '' ]?.localeVariant || localeData?.[ '' ]?.localeSlug;

	if ( ! locale || 'en' === locale ) {
		return params;
	}

	let localeQueryParam;
	const query = parse( params.query, { depth: 10 } );

	if ( params.apiNamespace ) {
		// v2 api request
		localeQueryParam = { _locale: locale };
	} else {
		localeQueryParam = { locale };
	}

	return Object.assign( params, {
		query: stringify( Object.assign( localeQueryParam, query ), { arrayFormat: 'brackets' } ),
	} );
}

/**
 * Modifies a WPCOM instance, returning an updated instance with included
 * localization helpers. Specifically, this adds a locale query parameter
 * by default.
 * @param {Object} wpcom Original WPCOM instance
 * @returns {Object} Modified WPCOM instance with localization helpers
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
