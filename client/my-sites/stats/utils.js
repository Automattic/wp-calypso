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
 * @param {*} redirectURL If passed, redirect to the URL after 250ms
 */
export const trackStatsAnalyticsEvent = ( eventName, properties, redirectURL = null ) => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	// publish an event
	const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	recordTracksEvent( `${ event_from }_${ eventName }`, properties );

	// redirect to the Purchase page
	if ( redirectURL ) {
		setTimeout( () => page( redirectURL ), 250 );
	}
};
