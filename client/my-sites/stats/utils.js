import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import moment from 'moment';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { DATE_FORMAT } from 'calypso/my-sites/stats/constants';
import { getPostPreviewUrl } from 'calypso/state/posts/selectors';
import { getSite } from 'calypso/state/sites/selectors';

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
 * @param {string|number} dateString YYYY-MM-DD format or a timestamp
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

/**
 * The chart range parameters include the chart start date, chart end date, and chart period.
 * @typedef {Object} ChartRangeParams
 * @property {string} chartStart The start date of the chart range.
 * @property {string} chartEnd The end date of the chart range.
 * @property {string} chartPeriod The period of the chart range.
 */

/**
 * Process the start date and from period to determine the target chart range parameters.
 * @param {string} startDate The start date of the chart range.
 * @param {string} fromPeriod The period of the chart where the action comes from.
 * @returns {ChartRangeParams} The chart range parameters for navigating the chart.
 */
export const getChartRangeParams = ( startDate, fromPeriod ) => {
	const chartStart = startDate;
	let chartEnd = moment( chartStart )
		.endOf( fromPeriod === 'week' ? 'isoWeek' : fromPeriod )
		.format( DATE_FORMAT );

	// Do not go beyond the current date.
	if ( moment().isBefore( chartEnd ) ) {
		chartEnd = moment().format( DATE_FORMAT );
	}

	let chartPeriod = 'day';
	if ( fromPeriod === 'day' ) {
		chartPeriod = 'hour';
	} else if ( fromPeriod === 'year' ) {
		chartPeriod = 'month';
	}

	return {
		chartStart,
		chartEnd,
		chartPeriod,
	};
};

/**
 * Get the preview URL for a post.
 * When a site has a mapped domain, ensures the preview URL uses the unmapped domain
 * to avoid potential SSL/proxy issues during preview.
 * @param {Object} state - The Redux state object
 * @param {number} siteId - The site ID
 * @param {number} postId - The post ID
 * @returns {string|null} The preview URL with appropriate domain, or null if unavailable
 */
export const getMappedPreviewUrl = ( state, siteId, postId ) => {
	const basePreviewUrl = getPostPreviewUrl( state, siteId, postId );
	if ( ! basePreviewUrl ) {
		return basePreviewUrl;
	}

	const site = getSite( state, siteId );
	if ( ! site ) {
		return basePreviewUrl;
	}

	try {
		const previewUrl = new URL( basePreviewUrl );

		// Ensure HTTPS if the site uses HTTPS
		if ( site.URL ) {
			const siteUrl = new URL( site.URL );
			if ( siteUrl.protocol === 'https:' ) {
				previewUrl.protocol = 'https:';
			}
		}

		// Use unmapped domain if this is a mapped domain site
		const shouldUseUnmappedDomain = site.options?.is_mapped_domain && site.options?.unmapped_url;
		if ( shouldUseUnmappedDomain ) {
			const unmappedUrl = new URL( site.options.unmapped_url );
			previewUrl.protocol = unmappedUrl.protocol;
			previewUrl.host = unmappedUrl.host;
		}

		return previewUrl.toString();
	} catch ( error ) {
		return basePreviewUrl;
	}
};
