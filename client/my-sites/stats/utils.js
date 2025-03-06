import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { parse as parseQs, stringify as stringifyQs } from 'qs';

/**
 * Update query for current page or passed in URL
 * @param {Object} query query object
 * @param {string} path full or partial URL. pathname and search required
 * @returns pathname concatenated with query string
 */
export function getPathWithUpdatedQueryString( query = {}, path = page.current ) {
	const parsedUrl = getUrlParts( path );
	let search = parsedUrl.search;
	const pathname = parsedUrl.pathname;

	// HACK: page.js adds a `?...page=stats...` query param to the URL in Odyssey on page refresh everytime.
	// Test whether there are two query strings (two '?').
	if ( search.replaceAll( /[^?]/g, '' ).length > 1 ) {
		// If so, we remove the last '?' and the query string following it with the lazy match regex.
		search = search?.replace( /(\?[^?]*)\?.*$/, '$1' );
	}

	const updatedSearch = {
		...parseQs( search.substring( 1 ), { parseArrays: false } ),
		...query,
	};

	const updatedSearchString = stringifyQs( updatedSearch );
	if ( ! updatedSearchString ) {
		return pathname;
	}

	return `${ pathname }?${ updatedSearchString }`;
}

/**
 * Add analytics event.
 * @param {*} eventName Analytics event name, automatically prefixed with 'jetpack_odyssey' or 'calypso'
 * @param {*} properties Analytics properties
 */
export const trackStatsAnalyticsEvent = ( eventName, properties = {} ) => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	// publish an event
	const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	recordTracksEvent( `${ event_from }_${ eventName }`, properties );
};

/**
 * Prepare query string for redirection on both Calypso and Odyssey Stats
 * Make sure to append the query if we are working inside wp-admin.
 * @param {string} pathname base pathname
 * @param {Object} query query object
 * @returns pathname concatenated with query string
 */
export const appendQueryStringForRedirection = ( pathname, query = {} ) => {
	const queryString = new URLSearchParams( query ).toString();

	return `${ pathname }${ queryString ? '?' : '' }${ queryString }`;
};

/**
 * Parse a date string into a Date object in the timezone of browser.
 *
 * @param {string|number} dateString YYYY-MM-DD format or a timestamp
 *
 * @returns {Date} A Date object in the timezone of the browser.
 */
export const parseLocalDate = ( dateString ) => {
	let validDateString = dateString;

	const dateStringSplits = dateString.split( ' ' );
	// For date strings like '2025-01-01 01:00:00'.
	if ( dateStringSplits.length === 2 ) {
		validDateString = `${ dateStringSplits[ 0 ] }T${ dateStringSplits[ 1 ] }Z`;
	} else if ( dateStringSplits.length === 1 ) {
		validDateString = `${ dateStringSplits[ 0 ] }T00:00:00Z`;
	}

	// Compatible with Date object.
	const date = new Date( validDateString );
	if ( isNaN( date.getTime() ) ) {
		return date;
	}

	// Adjust the date to the timezone of the browser.
	date.setMinutes( date.getMinutes() + date.getTimezoneOffset() );

	return date;
};
