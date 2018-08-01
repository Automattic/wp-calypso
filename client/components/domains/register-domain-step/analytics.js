/** @format */

/**
 * External dependencies
 */
import { flow, mapKeys, mapValues, snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

export const recordMapDomainButtonClick = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Map it" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_mapping_button_click', { section } )
	);

export const recordTransferDomainButtonClick = ( section, source ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Use a Domain I own" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_transfer_button_click', { section, source } )
	);

export const recordUseYourDomainButtonClick = ( section, source ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Use a Domain I own" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_use_my_domain_button_click', {
			section,
			source,
		} )
	);

export const recordSearchFormSubmit = (
	searchBoxValue,
	section,
	timeDiffFromLastSearch,
	count,
	vendor
) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Submitted Search Form',
			'Search Box Value',
			searchBoxValue
		),
		recordTracksEvent( 'calypso_domain_search', {
			search_box_value: searchBoxValue,
			seconds_from_last_search: timeDiffFromLastSearch,
			search_count: count,
			search_vendor: vendor,
			section,
		} )
	);

export const recordSearchFormView = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Landed on Search' ),
		recordTracksEvent( 'calypso_domain_search_pageview', { section } )
	);

export const recordSearchResultsReceive = (
	searchQuery,
	searchResults,
	responseTimeInMs,
	resultCount,
	section
) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Receive Results', 'Response Time', responseTimeInMs ),
		recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
			search_query: searchQuery,
			results: searchResults.join( ';' ),
			response_time_ms: responseTimeInMs,
			result_count: resultCount,
			section,
		} )
	);

export const recordDomainAvailabilityReceive = (
	searchQuery,
	availableStatus,
	responseTimeInMs,
	section
) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Domain Availability Result',
			'Domain Available Status',
			availableStatus
		),
		recordTracksEvent( 'calypso_domain_search_results_availability_receive', {
			search_query: searchQuery,
			available_status: availableStatus,
			response_time: responseTimeInMs,
			section,
		} )
	);

export function recordShowMoreResults( searchQuery, pageNumber, section ) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Show More Results' ),
		recordTracksEvent( 'calypso_domain_search_show_more_results', {
			search_query: searchQuery,
			page_number: pageNumber,
			section,
		} )
	);
}

function processFiltersForAnalytics( filters ) {
	const convertArraysToCSV = input =>
		mapValues( input, value => ( Array.isArray( value ) ? value.join( ',' ) : value ) );
	const prepareKeys = input => mapKeys( input, ( value, key ) => `filters_${ snakeCase( key ) }` );
	const transformation = flow(
		prepareKeys,
		convertArraysToCSV
	);
	return transformation( filters );
}

export function recordFiltersReset( filters, keysToReset, section ) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Filters Reset' ),
		recordTracksEvent( 'calypso_domain_search_filters_reset', {
			keys_to_reset: keysToReset.join( ',' ),
			section,
			...processFiltersForAnalytics( filters ),
		} )
	);
}

export function recordFiltersSubmit( filters, section ) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Filters Submit' ),
		recordTracksEvent( 'calypso_domain_search_filters_submit', {
			section,
			...processFiltersForAnalytics( filters ),
		} )
	);
}
