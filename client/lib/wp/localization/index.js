/**
 * External dependencies
 */
import { parse, stringify } from 'qs';

/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'state/selectors/get-current-locale-variant';

/**
 * Module variables
 */
let locale;

/**
 * Setter function for internal locale value
 *
 * @param {string} localeToSet Locale to set
 */
export function setLocale( localeToSet ) {
	locale = localeToSet;
}

/**
 * Getter function for internal locale value
 *
 * @returns {string} Locale
 */
export function getLocale() {
	return locale;
}

/**
 * Given a WPCOM parameter set, modifies the query such that a non-default
 * locale is added to the query parameter.
 *
 * @param  {object} params Original parameters
 * @returns {object}        Revised parameters, if non-default locale
 */
export function addLocaleQueryParam( params ) {
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

/**
 * Subscribes to the provided Redux store instance, updating the known locale
 * value to the latest value when state changes.
 *
 * @param {object} store Redux store instance
 */
export function bindState( store ) {
	function setLocaleFromState() {
		const state = store.getState();
		const localeVariant = getCurrentLocaleVariant( state );
		const localeSlug = getCurrentLocaleSlug( state );
		setLocale( localeVariant || localeSlug );
	}

	store.subscribe( setLocaleFromState );
	setLocaleFromState();
}
